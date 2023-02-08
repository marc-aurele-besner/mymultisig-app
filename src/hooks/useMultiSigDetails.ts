import { useNetwork, useContractReads } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

const useMultiSigDetails = (multiSigAddress: `0x${string}`, address: `0x${string}`) => {
  const { chain } = useNetwork()
  const myMultiSig = {
    address: multiSigAddress,
    abi: MyMultiSig,
    chainId: chain?.id,
  }
  const { data, error, isIdle, isError, isLoading, isSuccess, isFetched, isRefetching, refetch, status } =
    useContractReads({
      contracts: [
        {
          ...myMultiSig,
          functionName: 'name',
        },
        {
          ...myMultiSig,
          functionName: 'version',
        },
        {
          ...myMultiSig,
          functionName: 'threshold',
        },
        {
          ...myMultiSig,
          functionName: 'ownerCount',
        },
        {
          ...myMultiSig,
          functionName: 'nonce',
        },
        {
          ...myMultiSig,
          functionName: 'isOwner',
          args: [address],
        },
      ],
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

export default useMultiSigDetails
