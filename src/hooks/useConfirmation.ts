import { useWaitForTransactionReceipt } from 'wagmi'

const useConfirmation = (hash: `0x${string}`) => {
  const { data, error, isLoading, isError, isSuccess, isFetched, isRefetching, refetch, status } =
    useWaitForTransactionReceipt({
      hash
    })

  return {
    data,
    error,
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
