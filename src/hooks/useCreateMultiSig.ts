import { useNetwork, usePrepareContractWrite, useContractEvent } from 'wagmi'
import { BigNumber } from 'ethers'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

import { MultiSigConstructorArgs, MultiSig } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import { signData, addContent } from '../utils'

const useCreateMultiSig = (constructorArgs: MultiSigConstructorArgs, multiSigFactoryAddress: `0x${string}`) => {
  const { chain } = useNetwork()
  const { addMultiSig } = useMultiSigs()
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const { config } = usePrepareContractWrite({
    chainId: chain?.id,
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    functionName: 'createMultiSig',
    args: [constructorArgs.contractName, constructorArgs.owners, constructorArgs.threshold]
  })
  const { data, error, isError, isIdle, isLoading, isSuccess, write, writeAsync, reset, status, dataFinal, isFinal } =
    useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
  useContractEvent({
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    eventName: 'MyMultiSigCreated',
    listener: (creator, contractAddress, contractIndex, contractName, originalOwners) => {
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
    }
  })
  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    write,
    writeAsync,
    reset,
    status,
    dataFinal,
    isFinal
  }
}

export default useCreateMultiSig
