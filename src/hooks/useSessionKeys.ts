import { useCallback, useEffect, useMemo, useState } from 'react'
import { concat } from 'viem'
import {
  useAccount,
  useBytecode,
  useChainId,
  useChains,
  usePublicClient,
  useReadContracts,
  useSendTransaction,
  useSwitchChain,
  useWriteContract
} from 'wagmi'
import { toast } from 'sonner'

import useAdvancedFeatures from './useAdvancedFeatures'
import decodeContractError from '../utils/decodeContractError'
import {
  CANONICAL_CREATE2_DEPLOYER,
  SESSION_KEY_MODULE_ADDRESS,
  SESSION_KEY_MODULE_INIT_CODE,
  SESSION_KEY_MODULE_SALT,
  sessionKeyModuleAbi
} from '../constants/abi/sessionKeyModule'
import { SessionKeyRecord, SessionKeyStatus, sessionKeyStatus } from '../utils/sessionKeys'

// Public RPC endpoints commonly cap eth_getLogs ranges around 10k blocks; when
// a full-range query is refused, scan backwards in windows under that cap.
const CHUNK_SIZE = 9_999n
const MAX_CHUNKS = 12

export type SessionKeyEntry = {
  key: `0x${string}`
  status: SessionKeyStatus
  record?: SessionKeyRecord
  remaining?: bigint
  // Scope of the latest grant seen in the module's logs; empty when the key
  // was looked up by address and no grant log was found.
  targets: readonly `0x${string}`[]
  selectors: readonly `0x${string}`[]
}

type GrantLog = { key: `0x${string}`; targets: readonly `0x${string}`[]; selectors: readonly `0x${string}`[] }

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

// Session keys of one Extended wallet: whether the shared SessionKeyModule
// exists on this chain and is enabled on the wallet, the keys it granted, and
// the owner actions that do not need a quorum (deploying the module,
// revoking a key).
const useSessionKeys = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address, chainId: walletChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const publicClient = usePublicClient({ chainId: chain?.id })
  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()
  const {
    modules,
    allowedTargetsEnabled,
    supportsAdvanced,
    refetch: refetchAdvanced
  } = useAdvancedFeatures(multiSigAddress)

  const {
    data: moduleCode,
    isFetched: moduleFetched,
    refetch: refetchModuleCode
  } = useBytecode({
    address: SESSION_KEY_MODULE_ADDRESS,
    chainId: chain?.id
  })
  const { data: deployerCode } = useBytecode({ address: CANONICAL_CREATE2_DEPLOYER, chainId: chain?.id })
  // getCode resolves to undefined for an account without code.
  const moduleDeployed = moduleCode != null && moduleCode !== '0x'
  const deployerAvailable = deployerCode != null && deployerCode !== '0x'
  const moduleEnabled = modules.some((m) => same(m, SESSION_KEY_MODULE_ADDRESS))

  const [grants, setGrants] = useState<GrantLog[]>([])
  const [revokedKeys, setRevokedKeys] = useState<string[]>([])
  const [lookedUp, setLookedUp] = useState<`0x${string}`[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPartial, setLogsPartial] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [isDeploying, setIsDeploying] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    if (publicClient == null || !moduleDeployed || multiSigAddress === '0x') return
    let cancelled = false
    const fetchRange = async (fromBlock: bigint, toBlock: bigint | 'latest') => {
      const [granted, revoked] = await Promise.all([
        publicClient.getContractEvents({
          address: SESSION_KEY_MODULE_ADDRESS,
          abi: sessionKeyModuleAbi,
          eventName: 'SessionKeyGranted',
          args: { wallet: multiSigAddress },
          fromBlock,
          toBlock
        }),
        publicClient.getContractEvents({
          address: SESSION_KEY_MODULE_ADDRESS,
          abi: sessionKeyModuleAbi,
          eventName: 'SessionKeyRevoked',
          args: { wallet: multiSigAddress },
          fromBlock,
          toBlock
        })
      ])
      return { granted, revoked }
    }
    const load = async () => {
      setLogsLoading(true)
      setLogsPartial(false)
      try {
        const ranges: Awaited<ReturnType<typeof fetchRange>>[] = []
        try {
          ranges.push(await fetchRange(0n, 'latest'))
        } catch {
          // Range refused: walk back over the most recent windows instead, and
          // keep what was found when an older window is refused too (pruned
          // history, rate limits).
          let toBlock = await publicClient.getBlockNumber()
          let complete = false
          for (let i = 0; i < MAX_CHUNKS; i++) {
            const fromBlock = toBlock >= CHUNK_SIZE ? toBlock - CHUNK_SIZE : 0n
            try {
              ranges.push(await fetchRange(fromBlock, toBlock))
            } catch (error) {
              console.warn('Session key log scan stopped early', error)
              break
            }
            if (fromBlock === 0n) {
              complete = true
              break
            }
            toBlock = fromBlock - 1n
          }
          if (!cancelled) setLogsPartial(!complete)
        }
        if (cancelled) return
        // Oldest first, so the latest grant of a key wins.
        const granted = ranges
          .flatMap((r) => r.granted)
          .sort((a, b) => Number((a.blockNumber ?? 0n) - (b.blockNumber ?? 0n)))
        const latest = new Map<string, GrantLog>()
        for (const log of granted) {
          const { key, targets, selectors } = log.args
          if (key == null) continue
          latest.set(key.toLowerCase(), { key, targets: targets ?? [], selectors: selectors ?? [] })
        }
        setGrants(Array.from(latest.values()))
        setRevokedKeys(ranges.flatMap((r) => r.revoked).map((log) => String(log.args.key ?? '').toLowerCase()))
      } catch (error) {
        console.error('Session key log scan failed', error)
        if (!cancelled) setLogsPartial(true)
      } finally {
        if (!cancelled) setLogsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [publicClient, moduleDeployed, multiSigAddress, refreshNonce])

  const keys = useMemo(() => {
    const all = new Map<string, `0x${string}`>()
    for (const grant of grants) all.set(grant.key.toLowerCase(), grant.key)
    for (const key of lookedUp) all.set(key.toLowerCase(), key)
    return Array.from(all.values())
  }, [grants, lookedUp])

  const { data: records, refetch: refetchRecords } = useReadContracts({
    contracts: keys.flatMap((key) => [
      {
        chainId: chain?.id,
        address: SESSION_KEY_MODULE_ADDRESS,
        abi: sessionKeyModuleAbi,
        functionName: 'sessionKey' as const,
        args: [multiSigAddress, key] as const
      },
      {
        chainId: chain?.id,
        address: SESSION_KEY_MODULE_ADDRESS,
        abi: sessionKeyModuleAbi,
        functionName: 'sessionBudgetRemaining' as const,
        args: [multiSigAddress, key] as const
      }
    ]),
    allowFailure: true,
    query: { enabled: moduleDeployed && keys.length > 0 }
  })

  const nowSeconds = Math.floor(Date.now() / 1000)
  const entries: SessionKeyEntry[] = keys.map((key, index) => {
    const raw = records?.[index * 2]
    const remainingRaw = records?.[index * 2 + 1]
    const value =
      raw?.status === 'success' && typeof raw.result === 'object'
        ? (raw.result as Omit<SessionKeyRecord, 'validAfter' | 'validUntil'> & {
            validAfter: number
            validUntil: number
          })
        : undefined
    const record: SessionKeyRecord | undefined =
      value != null
        ? {
            validAfter: Number(value.validAfter),
            validUntil: Number(value.validUntil),
            ethBudget: value.ethBudget,
            ethSpent: value.ethSpent,
            restrictSelectors: value.restrictSelectors
          }
        : undefined
    const grant = grants.find((g) => same(g.key, key))
    // A revoke after the latest grant leaves validUntil at 0, which the
    // on-chain record already reflects; the logs only hide stale scope.
    const revoked = revokedKeys.includes(key.toLowerCase()) && record?.validUntil === 0
    return {
      key,
      status: sessionKeyStatus(record, nowSeconds),
      record,
      remaining: remainingRaw?.status === 'success' ? (remainingRaw.result as bigint) : undefined,
      targets: revoked ? [] : (grant?.targets ?? []),
      selectors: revoked ? [] : (grant?.selectors ?? [])
    }
  })

  const ensureChain = async () => {
    if (chain != null && walletChainId !== chain.id) await switchChainAsync({ chainId: chain.id })
  }

  // Permissionless: the canonical CREATE2 deployer puts the module at the same
  // address on every chain, whoever sends the transaction.
  const deployModule = async () => {
    if (publicClient == null || isDeploying) return
    setIsDeploying(true)
    try {
      await ensureChain()
      const hash = await sendTransactionAsync({
        to: CANONICAL_CREATE2_DEPLOYER,
        data: concat([SESSION_KEY_MODULE_SALT, SESSION_KEY_MODULE_INIT_CODE]),
        chainId: chain?.id
      })
      toast.info('Deploying the session-key module...')
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 1, timeout: 180_000 })
      toast.success('Session-key module deployed on this network')
      await refetchModuleCode()
    } catch (error) {
      console.error('Session-key module deploy failed', error)
      toast.error(decodeContractError(error) ?? 'The module deployment failed.')
    } finally {
      setIsDeploying(false)
    }
  }

  // Any single owner can revoke without a quorum, so a leaked key dies now.
  const revoke = async (key: `0x${string}`) => {
    if (publicClient == null || revoking != null) return
    setRevoking(key)
    try {
      await ensureChain()
      const hash = await writeContractAsync({
        chainId: chain?.id,
        address: SESSION_KEY_MODULE_ADDRESS,
        abi: sessionKeyModuleAbi,
        functionName: 'revokeSessionKey',
        args: [multiSigAddress, key]
      })
      toast.info('Revoking the session key...')
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 1, timeout: 120_000 })
      toast.success('Session key revoked')
      setRefreshNonce((n) => n + 1)
      await refetchRecords()
    } catch (error) {
      console.error('Session key revoke failed', error)
      toast.error(decodeContractError(error) ?? 'Revoking the session key failed.')
    } finally {
      setRevoking(null)
    }
  }

  const lookUp = useCallback((key: `0x${string}`) => {
    setLookedUp((prev) => (prev.some((k) => same(k, key)) ? prev : [...prev, key]))
  }, [])

  const refresh = () => {
    setRefreshNonce((n) => n + 1)
    refetchAdvanced()
    void refetchModuleCode()
    void refetchRecords()
  }

  return {
    supportsModules: supportsAdvanced,
    moduleLoading: !moduleFetched,
    moduleDeployed,
    deployerAvailable,
    moduleEnabled,
    modules,
    allowlistOn: allowedTargetsEnabled === true,
    entries,
    logsLoading,
    logsPartial,
    isConnected: address != null,
    deployModule,
    isDeploying,
    revoke,
    revoking,
    lookUp,
    refresh
  }
}

export default useSessionKeys
