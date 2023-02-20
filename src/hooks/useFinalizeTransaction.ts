import { useContractWrite, useTransaction, useWaitForTransaction } from 'wagmi'
import { JsonFragment } from '@ethersproject/abi'
import { PrepareWriteContractResult } from '@wagmi/core'

const useFinalizeTransaction = <TFunctionName extends string>(
  config: PrepareWriteContractResult<JsonFragment[], TFunctionName, number>,
  notificationInfo: () => void,
  notificationSuccess: () => void,
  notificationError: () => void
) => {
  const { data, error, isLoading, isIdle, isSuccess, isError, write, writeAsync, reset, status } = useContractWrite({
    ...config,
    onError(error) {
      console.error('Error', error)
      notificationError()
    }
  })
  useTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
    cacheTime: 1_00,
    staleTime: 2_000,
    onSuccess() {
      notificationInfo()
    }
  })
  const { data: dataFinal, isSuccess: isFinal } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
    confirmations: 1,
    timeout: 120_000,
    cacheTime: 1_000,
    staleTime: 2_000,
    onSuccess() {
      notificationSuccess()
    },
    onError(error) {
      console.error('Error', error)
      notificationError()
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

export default useFinalizeTransaction
