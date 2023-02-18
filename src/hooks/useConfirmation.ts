import { useWaitForTransaction } from 'wagmi'

const useConfirmation = (hash: `0x${string}`) => {
  const { data, error, isIdle, isLoading, isError, isSuccess, isFetched, isRefetching, refetch, status } =
    useWaitForTransaction({
      hash
    })

  return {
    data,
    error,
    isIdle,
    isError,
    isLoading,
    isSuccess,
    isFetched,
    isRefetching,
    refetch,
    status
  }
}

export default useConfirmation
