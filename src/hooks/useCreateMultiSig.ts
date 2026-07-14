import { useEffect, useRef } from 'react'
import { useAccount, useChainId, useChains, useWatchContractEvent } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'
import contractConstants from 'mymultisig-contract/constants'
import { LegacyMyMultiSigCreatedEvent } from '../constants/abi/legacy'

import { MultiSigConstructorArgs, MultiSig } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import { extractMyMultiSigCreated } from '../utils/multiSigCreated'
import { addContent } from '../utils'

const useCreateMultiSig = (constructorArgs: MultiSigConstructorArgs, multiSigFactoryAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
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
  const {
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
  } = useFinalizeTransaction(config, notificationInfo, notificationSuccess, notificationError)
  // Addresses already handed to addContent this session, so the
  // receipt path and the event-watcher path cannot double-write to Neon (the
  // Zustand duplicate check alone races with the async API round-trip).
  const persistedAddresses = useRef(new Set<string>())

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
    if (persistedAddresses.current.has(contractAddress.toLowerCase())) return
    persistedAddresses.current.add(contractAddress.toLowerCase())
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
      allowOnlyOwnerRequest: isExtended ? (constructorArgs.isOnlyOwnerRequest ?? false) : false
    }
    addContent({ action: 'createMultiSigWallet', data: dataToAdd }).then(() => {
      addMultiSig(dataToAdd)
    })
  }

  // Primary persistence path: parse the creation event straight from the
  // transaction receipt once it confirms. Unlike the watchers below, this
  // cannot miss the event.
  useEffect(() => {
    if (!isFinal || dataFinal == null) return
    const created = extractMyMultiSigCreated(dataFinal.logs)
    if (created != null) persistCreatedMultiSig({ args: created.args }, created.contractVersion)
    // persistCreatedMultiSig is recreated per render; the receipt is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal, dataFinal])

  // Factory 0.1.x appends `threshold` to MyMultiSigCreated (new topic hash);
  // watch both shapes so old deployed factories keep working.
  useWatchContractEvent({
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    eventName: 'MyMultiSigCreated',
    onLogs: (logs) => logs.forEach((log: any) => persistCreatedMultiSig(log, contractConstants.CONTRACT_VERSION))
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
