import { useChainId, useChains, useReadContract } from 'wagmi'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import { JsonFragment } from '@ethersproject/abi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import { transactionValidUntil } from '../utils/transactionTypedData'

// Sentinel scheduledReadyAt writes after executeScheduled to block replays.
export const SCHEDULE_EXECUTED_SENTINEL = 2n ** 256n - 1n

// 0.5.0 Extended wallets with a timelock: sensitive calls (self-calls at a
// registered selector, or value above the configured threshold) revert on the
// direct execTransaction path with SensitiveCallRequiresDelay and must go
// schedule -> wait timelockDelay -> executeScheduled instead. The schedule is
// keyed by the transaction hash, consumes the same owner signatures as a
// direct execution, and binds the request's validUntil across the whole
// window. cancelScheduled needs no signatures (any owner).
const useScheduledTransaction = (
  multiSigAddress: `0x${string}`,
  request: MultiSigTransactionRequest,
  txHash: `0x${string}` | undefined,
  enabled: boolean
) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const base = {
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended as JsonFragment[]
  }

  const { data: timelockDelay } = useReadContract({
    ...base,
    functionName: 'timelockDelay',
    query: { enabled, retry: false }
  })
  const { data: currentNonce } = useReadContract({
    ...base,
    functionName: 'nonce',
    query: { enabled, retry: false }
  })
  const {
    data: readyAt,
    refetch: refetchReadyAt
  } = useReadContract({
    ...base,
    functionName: 'scheduledReadyAt',
    args: [txHash ?? '0x'],
    query: { enabled: enabled && txHash != null, retry: false }
  })
  // Sensitivity preview: self-calls check their selector registration; any
  // call checks the wei threshold. Best effort — the wallet remains the
  // authority (it reverts NotSensitive / SensitiveCallRequiresDelay).
  const isSelfCall = request.request.to.toLowerCase() === multiSigAddress.toLowerCase()
  const selector = request.request.data.length >= 10 ? (request.request.data.slice(0, 10) as `0x${string}`) : null
  const { data: sensitiveSelector } = useReadContract({
    ...base,
    functionName: 'isSensitiveSelector',
    args: [selector ?? '0x00000000'],
    query: { enabled: enabled && isSelfCall && selector != null, retry: false }
  })
  const { data: sensitiveValueThreshold } = useReadContract({
    ...base,
    functionName: 'sensitiveValueThreshold',
    query: { enabled, retry: false }
  })

  const txnNonce =
    request.request.txnNonce != null && request.request.txnNonce !== ''
      ? BigInt(request.request.txnNonce)
      : currentNonce != null
        ? BigInt(currentNonce as bigint)
        : undefined
  const scheduleArgs =
    txnNonce != null
      ? ([
          request.request.to,
          BigInt(request.request.value || '0'),
          request.request.data,
          BigInt(request.request.txnGas || '0'),
          txnNonce,
          transactionValidUntil(request.request)
        ] as const)
      : undefined

  const signatures = (request.request.signatures || '0x') as `0x${string}`
  const schedule = useFinalizeTransaction(
    {
      ...base,
      functionName: 'scheduleTransaction',
      args: [...(scheduleArgs ?? []), signatures]
    },
    notificationInfo,
    notificationSuccess,
    notificationError
  )
  const executeScheduled = useFinalizeTransaction(
    {
      ...base,
      functionName: 'executeScheduled',
      args: [...(scheduleArgs ?? []), signatures]
    },
    notificationInfo,
    notificationSuccess,
    notificationError
  )
  const cancelScheduled = useFinalizeTransaction(
    {
      ...base,
      functionName: 'cancelScheduled',
      args: scheduleArgs ?? []
    },
    notificationInfo,
    notificationSuccess,
    notificationError
  )

  const timelockEnabled = timelockDelay != null && BigInt(timelockDelay as bigint) > 0n
  const valueSensitive =
    sensitiveValueThreshold != null &&
    BigInt(sensitiveValueThreshold as bigint) > 0n &&
    BigInt(request.request.value || '0') >= BigInt(sensitiveValueThreshold as bigint)
  const looksSensitive = (isSelfCall && Boolean(sensitiveSelector)) || valueSensitive

  return {
    // Timelock surface missing (pre-0.5.0 or simple wallet) -> stays false.
    timelockEnabled,
    timelockDelay: timelockDelay != null ? BigInt(timelockDelay as bigint) : undefined,
    looksSensitive,
    readyAt: readyAt != null ? BigInt(readyAt as bigint) : undefined,
    ready: scheduleArgs != null,
    schedule,
    executeScheduled,
    cancelScheduled,
    refetchReadyAt
  }
}

export default useScheduledTransaction
