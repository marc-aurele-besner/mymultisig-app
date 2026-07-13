import { useAccount, useChainId, useChains, useWatchContractEvent } from 'wagmi'
import MyMultiSigFactory from '../constants/abi/MyMultiSigFactory.json'
import { LegacyMyMultiSigCreatedEvent } from '../constants/abi/legacy'

import { MultiSigConstructorArgs, MultiSig } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import { signData, addContent } from '../utils'

const useCreateMultiSig = (constructorArgs: MultiSigConstructorArgs, multiSigFactoryAddress: `0x${string}`) => {
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const { address: account } = useAccount()
  const { addMultiSig, multiSigs } = useMultiSigs()
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const isExtended = constructorArgs.walletType === 'extended'
  const config = {
    chainId: chain?.id,
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    functionName: (isExtended ? 'createMyMultiSigExtended' : 'createMultiSig') as string,
    args: isExtended
      ? ([
          constructorArgs.contractName,
          constructorArgs.owners,
          constructorArgs.threshold,
          constructorArgs.isOnlyOwnerRequest ?? false
        ] as const)
      : ([constructorArgs.contractName, constructorArgs.owners, constructorArgs.threshold] as const)
  }
  const { data, error, isError, isPending, isSuccess, writeContract, writeContractAsync, reset, status, dataFinal, isFinal } =
    useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)

  const persistCreatedMultiSig = (log: any, contractVersion: string) => {
    const args = log.args || (log as any)
    const creator = String(args.creator ?? '')
    const contractAddress = String(args.contractAddress ?? '')
    const contractIndex = args.contractIndex ?? 0
    const contractName = String(args.contractName ?? '')
    const originalOwners: string[] = Array.isArray(args.originalOwners) ? args.originalOwners.map(String) : []
    // Factory >= 0.1.x includes the threshold in the event; older factories
    // don't, so fall back to what the creator submitted.
    const threshold = args.threshold != null ? Number(args.threshold) : constructorArgs.threshold
    console.log('MyMultiSigCreated', creator, contractAddress, contractIndex, contractName, originalOwners, threshold)
    if (!chain || !contractAddress) return
    // The watcher sees every creation on this factory; only persist our own.
    if (account && creator.toLowerCase() !== account.toLowerCase()) return
    if (multiSigs.some((m) => m.address.toLowerCase() === contractAddress.toLowerCase())) return
    const dataToAdd: MultiSig = {
      chainId: chain.id,
      chainName: chain.name,
      factoryAddress: multiSigFactoryAddress,
      id: Number(contractIndex),
      name: contractName,
      version: contractVersion,
      address: `0x${contractAddress.substring(2)}`,
      threshold,
      ownerCount: originalOwners.length,
      nonce: 0,
      owners: originalOwners,
      isDeployed: true,
      walletType: constructorArgs.walletType ?? 'simple',
      allowOnlyOwnerRequest: isExtended ? constructorArgs.isOnlyOwnerRequest ?? false : false
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
        addMultiSig(dataToAdd)
      })
    })
  }

  // Factory 0.1.x appends `threshold` to MyMultiSigCreated (new topic hash);
  // watch both shapes so old deployed factories keep working.
  useWatchContractEvent({
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    eventName: 'MyMultiSigCreated',
    onLogs: (logs) => logs.forEach((log: any) => persistCreatedMultiSig(log, '0.1.3'))
  })
  useWatchContractEvent({
    address: multiSigFactoryAddress,
    abi: LegacyMyMultiSigCreatedEvent,
    eventName: 'MyMultiSigCreated',
    onLogs: (logs) => logs.forEach((log: any) => persistCreatedMultiSig(log, '0.0.2'))
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
