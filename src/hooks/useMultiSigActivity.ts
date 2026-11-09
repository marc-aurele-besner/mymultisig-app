import { useCallback, useEffect, useRef, useState } from 'react'
import { usePublicClient, useWatchContractEvent } from 'wagmi'
import type { Abi } from 'viem'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import type { IncomingTransfer } from '../lib/alchemy/transfers'
import { isRateLimitError, pause, RATE_LIMIT_MESSAGE, withRateLimitRetry } from '../lib/rpc/rateLimit'
import { isRpcError } from '../lib/rpc/rpcError'
import { getIncomingTransfers } from '../utils/api'

// The Extended ABI is a superset of the simple wallet's, so decoding against it
// covers every event either wallet type can emit.
const abi = MyMultiSigExtended as Abi

// Native ETH and token deposits emit no event the wallet can log, so they come
// from the indexer and carry this synthetic event name in the feed.
export const INCOMING_TRANSFER_EVENT = 'IncomingTransfer'

export type ActivityEntry = {
  id: string
  eventName: string
  args: Record<string, unknown>
  blockNumber: bigint
  transactionHash: `0x${string}`
  // Unix seconds; undefined while the block lookup is in flight or failed.
  timestamp?: number
}

// Public RPC endpoints commonly cap eth_getLogs ranges around 10k blocks, so
// scan backwards in windows that stay under that cap.
const CHUNK_SIZE = 9_999n
const MAX_CHUNKS_PER_LOAD = 12
const TARGET_ENTRIES_PER_LOAD = 10
// Windows are requested one after another with this gap, so a scan never fires
// a burst that a free-tier RPC quota rejects.
const CHUNK_GAP_MS = 300
// After the RPC rate-limits us, live polling stays quiet for this long.
const RATE_LIMIT_COOLDOWN_MS = 30_000

// Incoming funds are polled, not watched: a new deposit emits nothing to
// subscribe to. One poll per minute keeps indexer calls modest.
const LIVE_POLL_MS = 60_000
const LIVE_PAGES_PER_POLL = 5

// Block timestamps never change, so they are kept for the session. Shared across
// the Overview preview and the Activity tab, which both need them.
const blockTimestamps = new Map<string, number>()

export type ActivityOptions = {
  // RPC windows scanned per load; lower it for lightweight previews.
  maxChunksPerLoad?: number
  // Stop a log scan early once this many entries were found.
  targetEntries?: number
}

const toEntry = (log: {
  eventName?: string
  args?: unknown
  blockNumber: bigint | null
  transactionHash: `0x${string}` | null
  logIndex: number | null
}): ActivityEntry | null => {
  if (log.blockNumber == null || log.transactionHash == null || log.eventName == null) return null
  return {
    id: `${log.blockNumber}-${log.logIndex ?? 0}`,
    eventName: log.eventName,
    args: (log.args ?? {}) as Record<string, unknown>,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash
  }
}

const toTransferEntry = (t: IncomingTransfer): ActivityEntry => ({
  id: `transfer-${t.id}`,
  eventName: INCOMING_TRANSFER_EVENT,
  args: { from: t.from, asset: t.asset, value: t.value, category: t.category },
  blockNumber: BigInt(t.blockNumber),
  transactionHash: t.hash,
  timestamp: t.timestamp
})

const sortDesc = (a: ActivityEntry, b: ActivityEntry) => {
  if (a.blockNumber !== b.blockNumber) return a.blockNumber > b.blockNumber ? -1 : 1
  return b.id.localeCompare(a.id)
}

// Streams the wallet's on-chain history: an initial backwards scan from the
// chain tip, `loadOlder` to keep digging, and a live watcher that prepends new
// events as they land. Log entries are deduped by block number + log index;
// transfer entries by the indexer's unique id.
const useMultiSigActivity = (multiSigAddress: `0x${string}`, options?: ActivityOptions) => {
  const maxChunksPerLoad = options?.maxChunksPerLoad ?? MAX_CHUNKS_PER_LOAD
  const targetEntries = options?.targetEntries ?? TARGET_ENTRIES_PER_LOAD
  const publicClient = usePublicClient()
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [rpcFailure, setRpcFailure] = useState(false)
  const [oldestScanned, setOldestScanned] = useState<bigint | null>(null)
  // Where the transfer scan continues: the block it pinned and the indexer page key.
  // `pageKey: null` means the scan reached block 0.
  const [incomingCursor, setIncomingCursor] = useState<{ toBlock: bigint; pageKey: string | null } | null>(null)
  const loadingRef = useRef(false)
  // Live polling is skipped until this timestamp (ms) after a rate limit.
  const cooldownUntilRef = useRef(0)
  // First block not yet covered by the live poll. Set when the first load pins the tip.
  const liveFromRef = useRef<bigint | null>(null)
  const enabled = /^0x[a-fA-F0-9]{40}$/.test(multiSigAddress)
  const chainKey = publicClient?.chain?.id
  // Identifies the wallet+chain a scan was started for, so results landing
  // after a switch are dropped instead of merged into the wrong feed.
  const scanKey = `${chainKey}-${multiSigAddress.toLowerCase()}`
  const scanKeyRef = useRef(scanKey)
  scanKeyRef.current = scanKey

  const mergeEntries = (additions: ActivityEntry[]) => {
    if (additions.length === 0) return
    setEntries((prev) => {
      const seen = new Set(prev.map((e) => e.id))
      const fresh = additions.filter((e) => !seen.has(e.id))
      if (fresh.length === 0) return prev
      return [...prev, ...fresh].sort(sortDesc)
    })
  }

  const startCooldown = () => {
    cooldownUntilRef.current = Date.now() + RATE_LIMIT_COOLDOWN_MS
  }

  const requestTransfers = useCallback(
    (params: { fromBlock?: bigint; toBlock?: bigint; pageKey?: string }) => {
      const chainId = publicClient?.chain?.id
      if (chainId == null) return Promise.reject(new Error('Unknown chain'))
      return withRateLimitRetry(() =>
        getIncomingTransfers({
          address: multiSigAddress,
          chainId,
          fromBlock: params.fromBlock?.toString(),
          toBlock: params.toBlock?.toString(),
          pageKey: params.pageKey
        })
      )
    },
    [publicClient, multiSigAddress]
  )

  const attachTimestamps = useCallback(
    async (batch: ActivityEntry[]) => {
      if (publicClient == null || batch.length === 0) return
      const chainId = publicClient.chain?.id
      const missing = Array.from(new Set(batch.filter((e) => e.timestamp == null).map((e) => e.blockNumber)))
      if (missing.length === 0) return
      const found = new Map<bigint, number>()
      // One block at a time: a parallel burst is exactly what trips the rate limit.
      for (const blockNumber of missing) {
        const cacheKey = `${chainId}-${blockNumber}`
        const cached = blockTimestamps.get(cacheKey)
        if (cached != null) {
          found.set(blockNumber, cached)
          continue
        }
        try {
          const block = await withRateLimitRetry(() => publicClient.getBlock({ blockNumber }))
          const timestamp = Number(block.timestamp)
          blockTimestamps.set(cacheKey, timestamp)
          found.set(blockNumber, timestamp)
        } catch (err) {
          // Timestamps are cosmetic; stop early if the RPC is throttling us.
          if (isRateLimitError(err)) break
        }
      }
      if (found.size === 0) return
      setEntries((prev) =>
        prev.map((e) =>
          e.timestamp == null && found.has(e.blockNumber) ? { ...e, timestamp: found.get(e.blockNumber) } : e
        )
      )
    },
    [publicClient]
  )

  const incomingDone = incomingCursor != null && incomingCursor.pageKey == null

  const scanOlder = useCallback(async () => {
    if (publicClient == null || !enabled || loadingRef.current) return
    loadingRef.current = true
    setIsLoading(true)
    setError(null)
    setRateLimited(false)
    setRpcFailure(false)
    const startedFor = scanKeyRef.current
    const isCurrent = () => scanKeyRef.current === startedFor
    try {
      const tip = await withRateLimitRetry(() => publicClient.getBlockNumber())
      if (!isCurrent()) return
      // Anything above the tip read here is picked up by the live poll.
      if (liveFromRef.current == null) liveFromRef.current = tip + 1n

      const collected: ActivityEntry[] = []

      if (oldestScanned !== 0n) {
        let toBlock = oldestScanned != null ? oldestScanned - 1n : tip
        let found = 0
        for (let i = 0; i < maxChunksPerLoad && toBlock >= 0n && found < targetEntries; i++) {
          if (i > 0) await pause(CHUNK_GAP_MS)
          const fromBlock = toBlock >= CHUNK_SIZE ? toBlock - CHUNK_SIZE : 0n
          const logs = await withRateLimitRetry(() =>
            publicClient.getContractEvents({
              address: multiSigAddress,
              abi,
              fromBlock,
              toBlock
            })
          )
          if (!isCurrent()) return
          const batch = logs.map(toEntry).filter((e): e is ActivityEntry => e != null)
          found += batch.length
          // Merge each window as it lands, so a later failure keeps the progress made.
          collected.push(...batch)
          mergeEntries(batch)
          setOldestScanned(fromBlock)
          if (fromBlock === 0n) break
          toBlock = fromBlock - 1n
        }
        void attachTimestamps(collected)
      }

      if (!incomingDone) {
        const toBlock = incomingCursor?.toBlock ?? tip
        const page = await requestTransfers({ toBlock, pageKey: incomingCursor?.pageKey ?? undefined })
        if (!isCurrent()) return
        setIncomingCursor({ toBlock, pageKey: page.pageKey })
        const transfers = page.transfers.map(toTransferEntry)
        mergeEntries(transfers)
        void attachTimestamps(transfers)
      }
    } catch (err) {
      if (scanKeyRef.current !== startedFor) return
      setRpcFailure(isRpcError(err))
      if (isRateLimitError(err)) {
        startCooldown()
        setRateLimited(true)
        setError(RATE_LIMIT_MESSAGE)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load activity')
      }
    } finally {
      loadingRef.current = false
      setIsLoading(false)
    }
  }, [
    publicClient,
    enabled,
    multiSigAddress,
    oldestScanned,
    incomingCursor,
    incomingDone,
    requestTransfers,
    attachTimestamps,
    maxChunksPerLoad,
    targetEntries
  ])

  // Pulls transfers received since the last poll. Advances only once the whole
  // range is read, so a partial failure is retried on the next tick.
  const pollLive = async () => {
    if (publicClient == null || !enabled) return
    // Skip ticks while a scan is running or the RPC recently rate-limited us.
    if (loadingRef.current || Date.now() < cooldownUntilRef.current) return
    const from = liveFromRef.current
    if (from == null) return
    const startedFor = scanKeyRef.current
    try {
      const tip = await withRateLimitRetry(() => publicClient.getBlockNumber())
      if (tip < from) return
      const fresh: ActivityEntry[] = []
      let pageKey: string | undefined
      let complete = false
      for (let i = 0; i < LIVE_PAGES_PER_POLL; i++) {
        const page = await requestTransfers({ fromBlock: from, toBlock: tip, pageKey })
        if (scanKeyRef.current !== startedFor) return
        fresh.push(...page.transfers.map(toTransferEntry))
        if (page.pageKey == null) {
          complete = true
          break
        }
        pageKey = page.pageKey
      }
      mergeEntries(fresh)
      if (complete) liveFromRef.current = tip + 1n
      void attachTimestamps(fresh)
    } catch (err) {
      // Transient indexer or RPC failure; the next tick retries.
      if (isRateLimitError(err)) startCooldown()
    }
  }
  const pollRef = useRef(pollLive)
  pollRef.current = pollLive

  // Reset and rescan when the wallet or chain changes.
  useEffect(() => {
    setEntries([])
    setOldestScanned(null)
    setIncomingCursor(null)
    liveFromRef.current = null
    cooldownUntilRef.current = 0
    setError(null)
    setRateLimited(false)
    setRpcFailure(false)
  }, [multiSigAddress, chainKey])

  // Only the first load starts automatically. After a failure the user retries
  // from the feed, so a throttled RPC is never hammered in a loop.
  useEffect(() => {
    if (enabled && publicClient != null && oldestScanned == null && !loadingRef.current) void scanOlder()
  }, [enabled, publicClient, oldestScanned, scanOlder])

  useEffect(() => {
    if (!enabled || publicClient == null) return
    const timer = setInterval(() => void pollRef.current(), LIVE_POLL_MS)
    return () => clearInterval(timer)
  }, [enabled, publicClient, multiSigAddress, chainKey])

  useWatchContractEvent({
    address: multiSigAddress,
    abi,
    enabled,
    onLogs: (logs) => {
      const batch = (logs as unknown as Parameters<typeof toEntry>[0][])
        .map(toEntry)
        .filter((e): e is ActivityEntry => e != null)
      mergeEntries(batch)
      void attachTimestamps(batch)
    }
  })

  return {
    entries,
    isLoading,
    error,
    // True when the last failure was the RPC rate limit; a retry resumes the scan.
    rateLimited,
    // True when the last failure came from the RPC endpoint (down, slow, rate
    // limited), so the feed can point at the custom RPC settings.
    rpcFailure,
    // Blocks older than this have not been scanned yet.
    oldestScanned,
    hasOlder: oldestScanned == null || oldestScanned > 0n || !incomingDone,
    loadOlder: scanOlder
  }
}

export default useMultiSigActivity
