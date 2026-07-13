import { useState } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import MyMultiSigFactory from '../constants/abi/MyMultiSigFactory.json'
import { LegacyMyMultiSigCreatedEvent } from '../constants/abi/legacy'

// Tracks the address of the multisig created by the connected account.
// Persistence (Neon + Zustand) is owned by useCreateMultiSig; this hook only
// surfaces the deployed address for confirmation/verification UIs.
const useMyMultiSigCreated = (multiSigFactoryAddress: `0x${string}`) => {
  const { address: account } = useAccount()
  const [multiSigAddress, setMultiSigAddress] = useState<string | undefined>(undefined)

  const captureAddress = (log: any) => {
    const args = log.args || (log as any)
    const creator = String(args.creator ?? '')
    const contractAddress = String(args.contractAddress ?? '')
    if (!contractAddress) return
    if (account && creator.toLowerCase() !== account.toLowerCase()) return
    setMultiSigAddress(contractAddress)
  }

  useWatchContractEvent({
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    eventName: 'MyMultiSigCreated',
    onLogs: (logs) => logs.forEach(captureAddress)
  })
  useWatchContractEvent({
    address: multiSigFactoryAddress,
    abi: LegacyMyMultiSigCreatedEvent,
    eventName: 'MyMultiSigCreated',
    onLogs: (logs) => logs.forEach(captureAddress)
  })

  return {
    multiSigAddress
  }
}

export default useMyMultiSigCreated
