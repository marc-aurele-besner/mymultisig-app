import { useState } from 'react'
import { useWatchContractEvent, useChainId, useChains } from 'wagmi'
import MyMultiSigFactory from '../constants/abi/MyMultiSigFactory.json'
import { BigNumber } from 'ethers'

import { MultiSig } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { signData, addContent } from '../utils'

const useMyMultiSigCreated = (multiSigFactoryAddress: `0x${string}`) => {
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const { addMultiSig } = useMultiSigs()
  const [multiSigAddress, setMultiSigAddress] = useState<string | undefined>(undefined)

  useWatchContractEvent({
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    eventName: 'MyMultiSigCreated',
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        const args = log.args || (log as any)
        const creator = args.creator || args[0]
        const contractAddress = args.contractAddress || args[1]
        const contractIndex = args.contractIndex || args[2]
        const contractName = args.contractName || args[3]
        const originalOwners = args.originalOwners || args[4]
      console.log('MyMultiSigCreated', creator, contractAddress, contractIndex, contractName, originalOwners)
      if (chain) {
        setMultiSigAddress(String(contractAddress))
        const dataToAdd: MultiSig = {
          chainId: chain?.id || 0,
          chainName: chain?.name || 'unknown',
          factoryAddress: multiSigFactoryAddress,
          id: BigNumber.from(contractIndex).toNumber(),
          name: String(contractName),
          version: '0.0.2',
          address: `0x${String(contractAddress).substring(2)}`,
          threshold: 2,
          ownerCount: Array(originalOwners).length,
          nonce: 0,
          owners: Array(originalOwners).map((owner) => String(owner)),
          isDeployed: true
        }
        addMultiSig(dataToAdd)
        signData({
          action: 'createMultiSigWallet',
          chainId: chain.id,
          collection: 'multisig-wallets',
          data: dataToAdd,
          details: 'Add MultiSig wallets',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          addContent(dataSigned.message).then(() => {
            // console.log('addContent', dataSigned)
          })
        })
      }
      })
    }
  })

  return {
    multiSigAddress
  }
}

export default useMyMultiSigCreated
