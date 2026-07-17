import { useChainId, useChains, useReadContract, useWatchContractEvent } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import { JsonFragment } from '@ethersproject/abi'
import { LegacyTransactionFailedEvent, LegacyWalletErrors } from '../constants/abi/legacy'

import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../models/MultiSigs'
import { useNotification, useNotificationWarning } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import useWalletType from './useWalletType'
import useMultiSigs from '../states/multiSigs'
import { patchMultiSigRequest } from '../utils'
import { applyAdminActionToMultiSig, decodeSelfCall } from '../utils/adminActions'
import { isModernWallet } from '../utils/contractVersions'
import { transactionOperation, transactionValidUntil } from '../utils/transactionTypedData'
import persistMultiSigWalletPatch from '../utils/persistWallet'

// Keeps only the execTransaction overload whose input types match exactly.
// viem resolves overloads by name and argument count, which cannot separate
// the 0.5.0 Extended ABI's two 7-arg overloads ((..., nonce, validUntil, sigs)
// vs (..., validUntil, operation, sigs)) — and the first of those reverts with
// RequiresOperationByte on 0.5.0 wallets. Legacy custom errors ride along so
// pre-0.5.0 reverts still decode to their names.
const withExactExecOverload = (abi: JsonFragment[], inputTypes: string): JsonFragment[] => [
  ...abi.filter(
    (fragment) =>
      !(fragment.type === 'function' && fragment.name === 'execTransaction') ||
      (fragment.inputs ?? []).map((input) => input.type).join(',') === inputTypes
  ),
  ...(LegacyWalletErrors as unknown as JsonFragment[])
]

const useExecTransaction = (
  args: MultiSigExecTransactionArgs,
  multiSigAddress: `0x${string}`,
  existingRequest: MultiSigTransactionRequest,
  existingRequestId: string
) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const notificationEndOfLife = useNotificationWarning('Wallet approaching end of life')
  const { updateMultiSigTransactionRequest, updateMultiSig, multiSigs, multiSigTransactionRequests } = useMultiSigs()
  const { walletType, isFetched: walletTypeFetched } = useWalletType(multiSigAddress)
  const { data: versionData } = useReadContract({
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig,
    functionName: 'version',
    query: { enabled: multiSigAddress !== '0x' }
  })
  const walletVersion = versionData != null ? String(versionData) : undefined
  const modern = isModernWallet(walletVersion)
  const isExtended = walletType === 'extended'
  const useExplicitNonce = args.txnNonce != null && args.txnNonce !== ''
  const validUntil = transactionValidUntil(args)
  const operation = transactionOperation(args)
  // Overload per wallet generation:
  // - 0.5.0 Extended: operation byte required (the pre-operation overloads
  //   revert with RequiresOperationByte) — 8-arg with a pinned nonce, 7-arg
  //   (validUntil, operation) against the current nonce otherwise.
  // - 0.5.0 base: 6-arg with validUntil.
  // - pre-0.5.0: the original 6-arg pinned-nonce / 5-arg overloads.
  const config =
    modern && isExtended && useExplicitNonce
      ? {
          chainId: chain?.id,
          address: multiSigAddress,
          abi: withExactExecOverload(
            MyMultiSigExtended as JsonFragment[],
            'address,uint256,bytes,uint256,uint256,uint256,uint8,bytes'
          ),
          functionName: 'execTransaction',
          args: [args.to, args.value, args.data, args.txnGas, args.txnNonce, validUntil, operation, args.signatures] as const
        }
      : modern && isExtended
        ? {
            chainId: chain?.id,
            address: multiSigAddress,
            abi: withExactExecOverload(
              MyMultiSigExtended as JsonFragment[],
              'address,uint256,bytes,uint256,uint256,uint8,bytes'
            ),
            functionName: 'execTransaction',
            args: [args.to, args.value, args.data, args.txnGas, validUntil, operation, args.signatures] as const
          }
        : modern
          ? {
              chainId: chain?.id,
              address: multiSigAddress,
              abi: withExactExecOverload(MyMultiSig as JsonFragment[], 'address,uint256,bytes,uint256,uint256,bytes'),
              functionName: 'execTransaction',
              args: [args.to, args.value, args.data, args.txnGas, validUntil, args.signatures] as const
            }
          : useExplicitNonce
            ? {
                chainId: chain?.id,
                address: multiSigAddress,
                abi: withExactExecOverload(
                  MyMultiSigExtended as JsonFragment[],
                  'address,uint256,bytes,uint256,uint256,bytes'
                ),
                functionName: 'execTransaction',
                args: [args.to, args.value, args.data, args.txnGas, args.txnNonce, args.signatures] as const
              }
            : {
                chainId: chain?.id,
                address: multiSigAddress,
                abi: withExactExecOverload(MyMultiSig as JsonFragment[], 'address,uint256,bytes,uint256,bytes'),
                functionName: 'execTransaction',
                args: [args.to, args.value, args.data, args.txnGas, args.signatures] as const
              }
  // The right overload is only known once the wallet's version and type have
  // been read; block execution until then rather than sending a call the
  // wallet would reject.
  const overloadReady = versionData != null && (!modern || walletTypeFetched)
  const preparationError = null
  const preparationIsError = false
  const {
    data,
    error,
    isError,
    isPending,
    isSuccess,
    writeContract,
    writeContractAsync,
    reset,
    status,
    dataFinal,
    isFinal
  } = useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)

  const markExecuted = (isSuccessful: boolean, requestPatch?: Partial<MultiSigExecTransactionArgs>) => {
    if (!chain || !existingRequestId) return
    const patch = {
      ...(requestPatch ? { request: { ...existingRequest.request, ...requestPatch } } : {}),
      dateExecuted: new Date().toISOString(),
      isExecuted: true,
      isSuccessful
    }
    patchMultiSigRequest(existingRequestId, patch).then(() => {
      updateMultiSigTransactionRequest(existingRequest.id, { ...existingRequest, ...patch })
    })
    // Owner/threshold operations are self-calls; once executed, mirror their
    // effect onto the locally stored wallet and into Neon (there is no
    // getOwners() to re-read; useAdminEventSync covers changes made by other
    // clients via the OwnerAdded/OwnerRemoved/ThresholdChanged events).
    if (isSuccessful && args.to.toLowerCase() === multiSigAddress.toLowerCase()) {
      const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
      if (stored) {
        const walletPatch = applyAdminActionToMultiSig(args.data, stored)
        if (walletPatch) {
          updateMultiSig(multiSigAddress, walletPatch)
          persistMultiSigWalletPatch(chain.id, multiSigAddress, walletPatch)
        }
      }
      // Nonce-invalidating admin actions kill requests bound to the dropped
      // nonce; mark them cancelled instead of leaving them to fail preflight.
      const decoded = decodeSelfCall(args.data)
      if (decoded?.functionName === 'incrementNonce')
        cancelStaleRequests((r) => r.request.txnNonce == null || r.request.txnNonce === '')
      else if (decoded?.functionName === 'markNonceAsUsed')
        cancelStaleRequests((r) => r.request.txnNonce === String(decoded.args?.[0] ?? ''))
    }
  }

  const cancelStaleRequests = (isBoundToDroppedNonce: (r: MultiSigTransactionRequest) => boolean) => {
    if (!chain) return
    multiSigTransactionRequests
      .filter(
        (r) =>
          r.multiSigAddress.toLowerCase() === multiSigAddress.toLowerCase() &&
          r.id !== existingRequest.id &&
          !r.isExecuted &&
          !r.isCancelled &&
          isBoundToDroppedNonce(r)
      )
      .forEach((r) => {
        const cancelPatch = { isActive: false, isCancelled: true }
        patchMultiSigRequest(r.id, cancelPatch).then(() => {
          updateMultiSigTransactionRequest(r.id, { ...r, ...cancelPatch })
        })
      })
  }

  // Shared success handler for TransactionExecuted / TransactionExecutedOp.
  // Best-effort batches also emit MultiRequestExecuted, whose handler owns the
  // status write (it carries the per-step results); writing here too could
  // race it and drop batchResults. Strict batches revert as a whole instead
  // of emitting MultiRequestExecuted, so reaching this event at all means
  // every step succeeded.
  const handleExecutedEvent = () => {
    const steps = existingRequest.request.batchSteps
    if (steps && steps.length > 0) {
      if (existingRequest.request.strictBatch)
        markExecuted(true, { batchResults: steps.map(() => ({ success: true, returnData: '0x' })) })
      return
    }
    markExecuted(true)
  }

  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'TransactionExecuted',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const eventArgs = log.args || (log as any)
        console.log('TransactionExecuted', eventArgs.sender, eventArgs.to, eventArgs.value, eventArgs.txnNonce)
        handleExecutedEvent()
      })
    }
  })
  // 0.5.0 Extended wallets emit the operation-suffixed variants from the
  // operation-byte execTransaction path.
  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSigExtended,
    eventName: 'TransactionExecutedOp',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const eventArgs = log.args || (log as any)
        console.log('TransactionExecutedOp', eventArgs.sender, eventArgs.to, eventArgs.value, eventArgs.txnNonce, eventArgs.operation)
        handleExecutedEvent()
      })
    }
  })
  // MyMultiSig >= 0.1.x emits TxFailure (with the raw revert payload); older
  // deployments emit TransactionFailed. Watch both shapes.
  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'TxFailure',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const eventArgs = log.args || (log as any)
        console.log('TxFailure', eventArgs.sender, eventArgs.to, eventArgs.value, eventArgs.txnNonce, eventArgs.reason)
        markExecuted(false)
      })
    }
  })
  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSigExtended,
    eventName: 'TxFailureOp',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const eventArgs = log.args || (log as any)
        console.log('TxFailureOp', eventArgs.sender, eventArgs.to, eventArgs.value, eventArgs.txnNonce, eventArgs.reason)
        markExecuted(false)
      })
    }
  })
  useWatchContractEvent({
    address: multiSigAddress,
    abi: LegacyTransactionFailedEvent,
    eventName: 'TransactionFailed',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const eventArgs = log.args || (log as any)
        console.log('TransactionFailed', eventArgs.sender, eventArgs.to, eventArgs.value, eventArgs.txnNonce)
        markExecuted(false)
      })
    }
  })
  // Batch requests: capture the per-call outcome arrays emitted alongside the
  // outer transaction so the request detail view can show which legs failed.
  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'MultiRequestExecuted',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const eventArgs = log.args || (log as any)
        if (!existingRequest.request.batchSteps) return
        const successes: boolean[] = eventArgs.successes ?? []
        const returnData: string[] = eventArgs.returnData ?? []
        console.log('MultiRequestExecuted', eventArgs.txNonce, successes)
        markExecuted(true, {
          batchResults: successes.map((success, i) => ({ success, returnData: returnData[i] ?? '0x' }))
        })
      })
    }
  })
  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'ContractEndOfLife',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const eventArgs = log.args || (log as any)
        console.log('ContractEndOfLife', eventArgs.txNonceLefts)
        notificationEndOfLife(
          `Only ${String(eventArgs.txNonceLefts ?? 'a few')} transaction nonces remain on this wallet. Plan a migration to a new wallet.`
        )
      })
    }
  })
  return {
    data,
    preparationError,
    preparationIsError,
    error,
    isError,
    isPending,
    isSuccess,
    writeContract: () => {
      if (overloadReady) writeContract()
    },
    writeContractAsync,
    reset,
    status,
    dataFinal,
    isFinal
  }
}

export default useExecTransaction
