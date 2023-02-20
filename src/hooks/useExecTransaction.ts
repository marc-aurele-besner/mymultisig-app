import { useNetwork, usePrepareContractWrite, useContractEvent } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSigFactory.json'

import { MultiSigExecTransactionArgs } from '../models/MultiSigs'
import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'

const useCreateMultiSig = (args: MultiSigExecTransactionArgs, multiSigAddress: `0x${string}`) => {
  const { chain } = useNetwork()
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const { config } = usePrepareContractWrite({
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSig,
    functionName: 'execTransaction',
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
    }
  })
  useContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'TransactionFailed',
    listener: (executor, to, value, data, txnGas, txnNonce) => {
      console.log('TransactionFailed', executor, to, value, data, txnGas, txnNonce)
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

export default useCreateMultiSig
