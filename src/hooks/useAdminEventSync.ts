import { useChainId, useWatchContractEvent } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import { MultiSig } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import persistMultiSigWalletPatch from '../utils/persistWallet'

// Keeps the locally stored owner list and threshold in sync with the chain by
// watching the wallet's admin events (OwnerAdded / OwnerRemoved /
// ThresholdChanged). This also picks up changes executed by other clients,
// which the decode-the-self-call path in useExecTransaction cannot see.
// All patches are idempotent so overlapping sync paths cannot double-apply.
// onOwnersChanged fires on every owner event so callers can refresh cached
// on-chain reads (the getOwners() list on 0.5.0 wallets) alongside the store.
const useAdminEventSync = (multiSigAddress: `0x${string}`, onOwnersChanged?: () => void) => {
  const chainId = useChainId()
  const { multiSigs, updateMultiSig } = useMultiSigs()
  const enabled = /^0x[a-fA-F0-9]{40}$/.test(multiSigAddress)

  const applyPatch = (build: (stored: MultiSig) => Partial<MultiSig> | null) => {
    const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
    if (!stored) return
    const patch = build(stored)
    if (!patch) return
    updateMultiSig(multiSigAddress, patch)
    persistMultiSigWalletPatch(chainId, multiSigAddress, patch)
  }

  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'OwnerAdded',
    enabled,
    onLogs: (logs) => {
      if (logs.length > 0) onOwnersChanged?.()

      logs.forEach((log: any) => {
        const owner = String(log.args?.owner ?? '')
        if (!owner) return
        applyPatch((stored) =>
          stored.owners.some((o) => o.toLowerCase() === owner.toLowerCase())
            ? null
            : { owners: [...stored.owners, owner], ownerCount: stored.ownerCount + 1 }
        )
      })
    }
  })

  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'OwnerRemoved',
    enabled,
    onLogs: (logs) => {
      if (logs.length > 0) onOwnersChanged?.()

      logs.forEach((log: any) => {
        const owner = String(log.args?.owner ?? '')
        if (!owner) return
        applyPatch((stored) =>
          stored.owners.some((o) => o.toLowerCase() === owner.toLowerCase())
            ? {
                owners: stored.owners.filter((o) => o.toLowerCase() !== owner.toLowerCase()),
                ownerCount: Math.max(stored.ownerCount - 1, 0)
              }
            : null
        )
      })
    }
  })

  useWatchContractEvent({
    address: multiSigAddress,
    abi: MyMultiSig,
    eventName: 'ThresholdChanged',
    enabled,
    onLogs: (logs) =>
       
      logs.forEach((log: any) => {
        const threshold = log.args?.threshold
        if (threshold == null) return
        applyPatch((stored) => (stored.threshold === Number(threshold) ? null : { threshold: Number(threshold) }))
      })
  })
}

export default useAdminEventSync
