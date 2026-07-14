import { useChainId, useChains, useWatchContractEvent } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import { LegacyTransactionFailedEvent } from '../constants/abi/legacy'

import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../models/MultiSigs'
import { useNotification, useNotificationWarning } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import useMultiSigs from '../states/multiSigs'
import { updateContent } from '../utils'
import { applyAdminActionToMultiSig, decodeSelfCall } from '../utils/adminActions'
import persistMultiSigWalletPatch from '../utils/persistWallet'

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
  // Requests built against a pinned nonce (Extended wallets only) go through the
  // 6-arg overload; everything else uses the base 5-arg overload bound to the
  // wallet's current nonce.
  const useExplicitNonce = args.txnNonce != null && args.txnNonce !== ''
  const config = useExplicitNonce
    ? {
        chainId: chain?.id,
        address: multiSigAddress,
        abi: MyMultiSigExtended,
        functionName: 'execTransaction(address,uint256,bytes,uint256,uint256,bytes)' as const,
        args: [args.to, args.value, args.data, args.txnGas, args.txnNonce, args.signatures] as const
      }
    : {
        chainId: chain?.id,
        address: multiSigAddress,
        abi: MyMultiSig,
        functionName: 'execTransaction(address,uint256,bytes,uint256,bytes)' as const,
        args: [args.to, args.value, args.data, args.txnGas, args.signatures] as const
      }
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
    updateContent({ action: 'updateMultiSigRequest', data: patch }, existingRequestId).then(() => {
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
        updateContent({ action: 'updateMultiSigRequest', data: cancelPatch }, r.id).then(() => {
          updateMultiSigTransactionRequest(r.id, { ...r, ...cancelPatch })
        })
      })
  }

  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'TransactionExecuted',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const eventArgs = log.args || (log as any)
        console.log('TransactionExecuted', eventArgs.sender, eventArgs.to, eventArgs.value, eventArgs.txnNonce)
        // Batch executions also emit MultiRequestExecuted, whose handler owns
        // the status write (it carries the per-step results); writing here too
        // could race it and drop batchResults.
        if (existingRequest.request.batchSteps && existingRequest.request.batchSteps.length > 0) return
        markExecuted(true)
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
    writeContract,
    writeContractAsync,
    reset,
    status,
    dataFinal,
    isFinal
  }
}

export default useExecTransaction
