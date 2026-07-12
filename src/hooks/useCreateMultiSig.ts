import { useChainId, useChains, useWatchContractEvent } from 'wagmi'
import { BigNumber } from 'ethers'
import MyMultiSigFactory from '../constants/abi/MyMultiSigFactory.json'

import { MultiSigConstructorArgs, MultiSig } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import { signData, addContent } from '../utils'

const useCreateMultiSig = (constructorArgs: MultiSigConstructorArgs, multiSigFactoryAddress: `0x${string}`) => {
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const { addMultiSig } = useMultiSigs()
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const config = {
    chainId: chain?.id,
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    functionName: 'createMultiSig' as const,
    args: [constructorArgs.contractName, constructorArgs.owners, constructorArgs.threshold] as const
  }
  const { data, error, isError, isPending, isSuccess, writeContract, writeContractAsync, reset, status, dataFinal, isFinal } =
    useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
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
        signData({
          action: 'createMultiSigWallet',
          chainId: chain.id,
          collection: 'multisig-wallets',
          data: dataToAdd,
          details: 'Add MultiSig Wallets',
          signatureExpiry: 0
        }).then(async (dataSigned) => {
          addContent(dataSigned.message).then(() => {
            // setMultiSigAddress(String(contractAddress))
            addMultiSig(dataToAdd)
          })
        })
      }
      })
    }
  })
  return {
    data,
    error,
    isError,
    isPending,
    isSuccess,
    writeContract,
    writeContractAsync,
    reset,
    status,
    dataFinal,
    isFinal
  }
}

export default useCreateMultiSig
