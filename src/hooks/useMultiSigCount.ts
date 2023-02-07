import { useContractRead } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

const useMultiSigCount = (
  argument: {
    contractName: string
    owners: string[]
    threshold: number
  },
  multiSigFactoryAddress: `0x${string}`,
) => {
  const { data, error, isIdle, isError, isLoading, isSuccess, isFetched, isRefetching, refetch, status } =
    useContractRead({
      address: multiSigFactoryAddress,
      abi: MyMultiSigFactory,
      functionName: 'multiSigCount',
    })

  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    isFetched,
    isRefetching,
    refetch,
    status,
  }
}

export default useMultiSigCount
