import { useEffect, useRef } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'
import { JsonFragment } from '@ethersproject/abi'
import { buildCreateMultiSigCall } from '@mymultisig/protocol'

import { MultiSigConstructorArgs, MultiSig, isExtendedWallet } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { useNotification } from './notifications'
import useFinalizeTransaction from './useFinalizeTransaction'
import { extractMyMultiSigCreated } from '../utils/multiSigCreated'
import { createMultiSigWallet } from '../utils'

const useCreateMultiSig = (constructorArgs: MultiSigConstructorArgs, multiSigFactoryAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address: account } = useAccount()
  const { addMultiSig, multiSigs, multiSigFactory } = useMultiSigs()
  const { notificationInfo, notificationError, notificationSuccess } = useNotification()
  const isExtended = isExtendedWallet(constructorArgs.walletType)
  // 0.5.0 factories take the ERC-4337 EntryPoint on the Extended/Advanced
  // create calls; pre-0.5.0 factories keep the 4-arg shape, which the 0.5.0
  // package ABI no longer carries (vendored legacy fragment).
  const factoryVersion = multiSigFactory.find(
    (f) => f.chainId === chain?.id && f.address.toLowerCase() === multiSigFactoryAddress.toLowerCase()
  )?.version
  // 0.5.0 factories also expose the CREATE2 path (same creator + salt + args
  // -> same wallet address on every chain). The function/args choice lives in
  // the shared protocol module so agent tooling creates wallets identically.
  const createCall = buildCreateMultiSigCall({ ...constructorArgs, factoryVersion })
  const config = {
    chainId: chain?.id,
    address: multiSigFactoryAddress,
    abi: createCall.abi as unknown as JsonFragment[],
    functionName: createCall.functionName,
    args: createCall.args
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
  // Addresses already handed to createMultiSigWallet this session, so the
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
    // Only persist wallets created by the connected account.
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
    createMultiSigWallet(dataToAdd).then(() => {
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
