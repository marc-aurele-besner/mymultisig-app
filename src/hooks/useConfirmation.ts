import { useState } from 'react'
import { useNetwork, useWaitForTransaction, useContractEvent } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'
import { BigNumber } from 'ethers'

import useMultiSigs from '../states/multisigs'

const useConfirmation = (hash: `0x${string}`, multiSigFactoryAddress: `0x${string}`) => {
  const [multiSigAddress, setMultiSigAddress] = useState<string | undefined>(undefined)
  const { data, error, isIdle, isLoading, isError, isSuccess, isFetched, isRefetching, refetch, status } =
    useWaitForTransaction({
      hash,
    })
  const { addMultiSig } = useMultiSigs()
  const { chain } = useNetwork()
  const events = useContractEvent({
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    eventName: 'MyMultiSigCreated',
    listener: (creator, contractAddress, contractIndex, contractName, originalOwners) => {
      if (chain) {
        setMultiSigAddress(String(contractAddress))
        addMultiSig({
          chainId: chain?.id,
          chainName: chain?.name,
          factoryAddress: multiSigFactoryAddress,
          id: BigNumber.from(contractIndex).toNumber(),
          name: String(contractName),
          version: '0.0.2',
          address: `0x${String(contractAddress).substring(2)}`,
          threshold: 2,
          ownerCount: Array(originalOwners).length,
          nonce: 0,
          owners: Array(originalOwners).map((owner) => String(owner)),
          isDeployed: true,
        })
      }
    },
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
    status,
    events,
    multiSigAddress,
  }
}

export default useConfirmation
