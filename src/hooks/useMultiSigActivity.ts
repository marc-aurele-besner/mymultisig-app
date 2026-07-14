import { useCallback, useEffect, useRef, useState } from 'react'
import { usePublicClient, useWatchContractEvent } from 'wagmi'
import type { Abi } from 'viem'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

// The Extended ABI is a superset of the simple wallet's, so decoding against it
// covers every event either wallet type can emit.
const abi = MyMultiSigExtended as Abi

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

const sortDesc = (a: ActivityEntry, b: ActivityEntry) => {
  if (a.blockNumber !== b.blockNumber) return a.blockNumber > b.blockNumber ? -1 : 1
  return b.id.localeCompare(a.id)
}

// Streams the wallet's on-chain history: an initial backwards scan from the
// chain tip, `loadOlder` to keep digging, and a live watcher that prepends new
// events as they land. Entries are deduped by block number + log index.
const useMultiSigActivity = (multiSigAddress: `0x${string}`) => {
  const publicClient = usePublicClient()
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [oldestScanned, setOldestScanned] = useState<bigint | null>(null)
  const loadingRef = useRef(false)
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

  const attachTimestamps = useCallback(
    async (batch: ActivityEntry[]) => {
      if (publicClient == null || batch.length === 0) return
      const blockNumbers = Array.from(new Set(batch.map((e) => e.blockNumber)))
      try {
        const blocks = await Promise.all(blockNumbers.map((blockNumber) => publicClient.getBlock({ blockNumber })))
        const timestamps = new Map(blocks.map((b) => [b.number, Number(b.timestamp)]))
        setEntries((prev) =>
          prev.map((e) =>
            e.timestamp == null && timestamps.has(e.blockNumber)
              ? { ...e, timestamp: timestamps.get(e.blockNumber) }
              : e
          )
        )
      } catch {
        // Timestamps are cosmetic; the feed still renders without them.
      }
    },
    [publicClient]
  )

  const scanOlder = useCallback(async () => {
    if (publicClient == null || !enabled || loadingRef.current) return
    loadingRef.current = true
    setIsLoading(true)
    setError(null)
    const startedFor = scanKeyRef.current
    try {
      if (oldestScanned === 0n) return
      const startBlock = oldestScanned != null ? oldestScanned - 1n : await publicClient.getBlockNumber()
      let toBlock = startBlock
      let found = 0
      const collected: ActivityEntry[] = []
      for (let i = 0; i < MAX_CHUNKS_PER_LOAD && toBlock >= 0n && found < TARGET_ENTRIES_PER_LOAD; i++) {
        const fromBlock = toBlock >= CHUNK_SIZE ? toBlock - CHUNK_SIZE : 0n
        const logs = await publicClient.getContractEvents({
          address: multiSigAddress,
          abi,
          fromBlock,
          toBlock
        })
        if (scanKeyRef.current !== startedFor) return
        const batch = logs.map(toEntry).filter((e): e is ActivityEntry => e != null)
        collected.push(...batch)
        found += batch.length
        setOldestScanned(fromBlock)
        if (fromBlock === 0n) break
        toBlock = fromBlock - 1n
      }
      mergeEntries(collected)
      void attachTimestamps(collected)
    } catch (err) {
      if (scanKeyRef.current === startedFor) setError(err instanceof Error ? err.message : 'Failed to load activity')
    } finally {
      loadingRef.current = false
      setIsLoading(false)
    }
  }, [publicClient, enabled, multiSigAddress, oldestScanned, attachTimestamps])

  // Reset and rescan when the wallet or chain changes.
  useEffect(() => {
    setEntries([])
    setOldestScanned(null)
    setError(null)
  }, [multiSigAddress, chainKey])

  useEffect(() => {
    if (enabled && publicClient != null && oldestScanned == null && !loadingRef.current) void scanOlder()
  }, [enabled, publicClient, oldestScanned, scanOlder])

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
    // Blocks older than this have not been scanned yet.
    oldestScanned,
    hasOlder: oldestScanned == null || oldestScanned > 0n,
    loadOlder: scanOlder
  }
}

export default useMultiSigActivity
