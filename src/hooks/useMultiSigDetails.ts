import { useNetwork, useContractReads } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import { MultiSigOnChainData } from '../models/MultiSigs'

const useMultiSigDetails = (multiSigAddress: `0x${string}`, address: `0x${string}`) => {
  const { chain } = useNetwork()
  const myMultiSig = {
    address: multiSigAddress,
    abi: MyMultiSig,
    chainId: chain?.id
  }
  const { data, error, isIdle, isError, isLoading, isSuccess, isFetched, isRefetching, refetch, status } =
    useContractReads({
      contracts: [
        {
          ...myMultiSig,
          functionName: 'name'
        },
        {
          ...myMultiSig,
          functionName: 'version'
        },
        {
          ...myMultiSig,
          functionName: 'threshold'
        },
        {
          ...myMultiSig,
          functionName: 'ownerCount'
        },
        {
          ...myMultiSig,
          functionName: 'nonce'
        },
        {
          ...myMultiSig,
          functionName: 'isOwner',
          args: [address]
        }
      ],
      enabled: true
    })

  if (data) {
    const multiSigDetails: MultiSigOnChainData = {
      name: String(data[0]),
      version: String(data[1]),
      threshold: Number(data[2]),
      ownerCount: Number(data[3]),
      nonce: Number(data[4]),
      owners: [address]
    }
    return {
      multiSigDetails,
      data,
      error,
      isError,
      isIdle,
      isLoading,
      isSuccess,
      isFetched,
      isRefetching,
      refetch,
      status
    }
  } else {
    return {
      multiSigDetails: null,
      data,
      error,
      isError,
      isIdle,
      isLoading,
      isSuccess,
      isFetched,
      isRefetching,
      refetch,
      status
    }
  }
}

export default useMultiSigDetails
