import { useChainId, useChains, useWatchContractEvent } from 'wagmi'
import MyMultiSig from '../constants/abi/MyMultiSig.json'
import MyMultiSigExtended from '../constants/abi/MyMultiSigExtended.json'
import { LegacyTransactionFailedEvent } from '../constants/abi/legacy'

import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../models/MultiSigs'
import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import useMultiSigs from '../states/multiSigs'
import { signData, updateContent } from '../utils'

const useExecTransaction = (
  args: MultiSigExecTransactionArgs,
  multiSigAddress: `0x${string}`,
  existingRequest: MultiSigTransactionRequest,
  existingRequestRef: string
) => {
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const { updateMultiSigTransactionRequest } = useMultiSigs()
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
  const { data, error, isError, isPending, isSuccess, writeContract, writeContractAsync, reset, status, dataFinal, isFinal } =
    useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)

  const markExecuted = (isSuccessful: boolean, requestPatch?: Partial<MultiSigExecTransactionArgs>) => {
    if (!chain || !existingRequestRef) return
    const patch = {
      ...(requestPatch ? { request: { ...existingRequest.request, ...requestPatch } } : {}),
      dateExecuted: new Date().toISOString(),
      isExecuted: true,
      isSuccessful
    }
    signData({
      action: 'updateMultiSigRequest',
      chainId: chain.id,
      collection: 'multisig-requests',
      data: patch,
      details: 'Update MultiSig Request',
      signatureExpiry: 0
    }).then(async (dataSigned) => {
      updateContent(dataSigned.message, existingRequestRef).then(() => {
        updateMultiSigTransactionRequest(existingRequest.id, { ...existingRequest, ...patch })
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
