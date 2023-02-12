import { useState } from 'react'
import { useContractEvent } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'
import { BigNumber } from 'ethers'

import useMultiSigs from '../states/multiSigs'

const useMyMultiSigCreated = (multiSigFactoryAddress: `0x${string}`) => {
  const [multiSigAddress, setMultiSigAddress] = useState<string | undefined>(undefined)
  console.log('multiSigFactoryAddress', multiSigFactoryAddress)

  useContractEvent({
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    eventName: 'MyMultiSigCreated',
    // listener: (...args: unknown[]) => {
    //   console.log('args', args)
    listener: (creator, contractAddress) => {
      console.log('creator', creator)
      console.log('contractAddress', contractAddress)
      setMultiSigAddress(String(contractAddress))
      // if (chain) {
      //   addMultiSig({
      //     chainId: chain?.id || 0,
      //     chainName: chain?.name || 'unknown',
      //     factoryAddress: multiSigFactoryAddress,
      //     id: BigNumber.from(contractIndex).toNumber(),
      //     name: String(contractName),
      //     version: '0.0.2',
      //     address: `0x${String(contractAddress).substring(2)}`,
      //     threshold: 2,
      //     ownerCount: Array(originalOwners).length,
      //     nonce: 0,
      //     owners: Array(originalOwners).map((owner) => String(owner)),
      //     isDeployed: true
      //   })
      // }
    }
  })

  return {
    multiSigAddress
  }
}

export default useMyMultiSigCreated
