import { useChainId, useChains, useWatchContractEvent } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

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
  const config = {
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
  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'TransactionExecuted',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const args = log.args || (log as any)
        const executor = args.executor || args[0]
        const to = args.to || args[1]
        const value = args.value || args[2]
        const data = args.data || args[3]
        const txnGas = args.txnGas || args[4]
        const txnNonce = args.txnNonce || args[5]
      console.log('TransactionExecuted', executor, to, value, data, txnGas, txnNonce)

      if (chain && existingRequestRef)
        signData({
          action: 'updateMultiSigRequest',
          chainId: chain.id,
          collection: 'multisig-requests',
          data: {
            dateExecuted: new Date().toISOString(),
            isExecuted: true,
            isSuccessful: true
          },
          details: 'Update MultiSig Request',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          updateContent(dataSigned.message, existingRequestRef).then(() => {
            updateMultiSigTransactionRequest(existingRequest.id, {
              ...existingRequest,
              dateExecuted: new Date().toISOString(),
              isExecuted: true,
              isSuccessful: true
            })
          })
        })
      })
    }
  })
  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'TransactionFailed',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const args = log.args || (log as any)
        const executor = args.executor || args[0]
        const to = args.to || args[1]
        const value = args.value || args[2]
        const data = args.data || args[3]
        const txnGas = args.txnGas || args[4]
        const txnNonce = args.txnNonce || args[5]
      console.log('TransactionFailed', executor, to, value, data, txnGas, txnNonce)

      if (chain && existingRequestRef)
        signData({
          action: 'updateMultiSigRequest',
          chainId: chain.id,
          collection: 'multisig-requests',
          data: {
            dateExecuted: new Date().toISOString(),
            isExecuted: true,
            isSuccess: false
          },
          details: 'Update MultiSig Request',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          updateContent(dataSigned.message, existingRequestRef).then(() => {
            updateMultiSigTransactionRequest(existingRequest.id, {
              ...existingRequest,
              dateExecuted: new Date().toISOString(),
              isExecuted: true,
              isSuccessful: false
            })
          })
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
        const args = log.args || (log as any)
        const noncesLeft = args.noncesLeft || args[0]
      console.log('ContractEndOfLife', noncesLeft)
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
