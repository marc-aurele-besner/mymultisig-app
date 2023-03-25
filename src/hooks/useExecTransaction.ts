import { useNetwork, usePrepareContractWrite, useContractEvent } from 'wagmi'
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
  const { chain } = useNetwork()
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const { updateMultiSigTransactionRequest } = useMultiSigs()
  const {
    config,
    error: preparationError,
    isError: preparationIsError
  } = usePrepareContractWrite({
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig,
    functionName: 'execTransaction(address,uint256,bytes,uint256,bytes)',
    args: [args.to, args.value, args.data, args.txnGas, args.signatures]
  })
  const { data, error, isError, isIdle, isLoading, isSuccess, write, writeAsync, reset, status, dataFinal, isFinal } =
    useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
  useContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'TransactionExecuted',
    listener: (executor, to, value, data, txnGas, txnNonce) => {
      console.log('TransactionExecuted', executor, to, value, data, txnGas, txnNonce)

      if (chain && existingRequestRef)
        signData({
          action: 'updateMultiSigRequest',
          chainId: chain.id,
          collection: 'multisig-requests',
          data: {
            isExecuted: true,
            isSuccessful: true
          },
          details: 'Update MultiSig Request',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          updateContent(dataSigned.message, existingRequestRef).then(() => {
            updateMultiSigTransactionRequest(existingRequest.id, {
              ...existingRequest,
              isExecuted: true,
              isSuccessful: true
            })
          })
        })
    }
  })
  useContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'TransactionFailed',
    listener: (executor, to, value, data, txnGas, txnNonce) => {
      console.log('TransactionFailed', executor, to, value, data, txnGas, txnNonce)

      if (chain && existingRequestRef)
        signData({
          action: 'updateMultiSigRequest',
          chainId: chain.id,
          collection: 'multisig-requests',
          data: {
            isExecuted: true,
            isSuccess: false
          },
          details: 'Update MultiSig Request',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          updateContent(dataSigned.message, existingRequestRef).then(() => {
            updateMultiSigTransactionRequest(existingRequest.id, {
              ...existingRequest,
              isExecuted: true,
              isSuccessful: false
            })
          })
        })
    }
  })
  useContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'ContractEndOfLife',
    listener: (noncesLeft) => {
      console.log('ContractEndOfLife', noncesLeft)
    }
  })
  return {
    data,
    preparationError,
    preparationIsError,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    write,
    writeAsync,
    reset,
    status,
    dataFinal,
    isFinal
  }
}

export default useExecTransaction
