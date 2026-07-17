import { useChainId, useChains, useReadContract, useReadContracts } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import { MultiSigOnChainData } from '../models/MultiSigs'

const useMultiSigDetails = (multiSigAddress: `0x${string}`, address: `0x${string}`) => {
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const myMultiSig = {
    address: multiSigAddress,
    abi: MyMultiSig,
    chainId: chain?.id
  }
  // 0.5.0 wallets enumerate owners on-chain; the read reverts on older
  // deployments (owners were a bare mapping), so it stays out of the
  // allowFailure:false batch below and consumers fall back to the locally
  // tracked list when onChainOwners is undefined.
  const { data: ownersData, refetch: refetchOwners } = useReadContract({
    ...myMultiSig,
    functionName: 'getOwners',
    query: { enabled: multiSigAddress !== '0x', retry: false }
  })
  const onChainOwners =
    ownersData != null ? (ownersData as readonly string[]).map(String) : undefined
  const { data, error, isError, isLoading, isSuccess, isFetched, isRefetching, refetch, status } =
    useReadContracts({
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
      // Consumers index the raw values (data[0] = name, ...), so fail the whole
      // batch rather than returning per-call {result, status} wrappers.
      allowFailure: false,
      query: {
        enabled: true
      }
    })

  if (data) {
    const multiSigDetails: MultiSigOnChainData = {
      name: String(data[0]),
      version: String(data[1]),
      threshold: Number(data[2]),
      ownerCount: Number(data[3]),
      nonce: Number(data[4]),
      owners: onChainOwners ?? [address]
    }
    return {
          multiSigDetails,
          onChainOwners,
          refetchOwners,
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
      } else {
    return {
          multiSigDetails: null,
          onChainOwners,
          refetchOwners,
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
    }

    export default useMultiSigDetails
