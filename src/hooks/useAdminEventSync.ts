import { useChainId, useWatchContractEvent } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import type { Abi } from 'viem'

import { MultiSig } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import persistMultiSigWalletPatch from '../utils/persistWallet'

const ADMIN_EVENTS = ['OwnerAdded', 'OwnerRemoved', 'ThresholdChanged']
const adminEventsAbi = (MyMultiSig as Abi).filter((item) => item.type === 'event' && ADMIN_EVENTS.includes(item.name))

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

  const handleOwnerAdded = (owner: string) =>
    applyPatch((stored) =>
      stored.owners.some((o) => o.toLowerCase() === owner.toLowerCase())
        ? null
        : { owners: [...stored.owners, owner], ownerCount: stored.ownerCount + 1 }
    )

  const handleOwnerRemoved = (owner: string) =>
    applyPatch((stored) =>
      stored.owners.some((o) => o.toLowerCase() === owner.toLowerCase())
        ? {
            owners: stored.owners.filter((o) => o.toLowerCase() !== owner.toLowerCase()),
            ownerCount: Math.max(stored.ownerCount - 1, 0)
          }
        : null
    )

  // One watcher for all three admin events (dispatched by name) instead of one
  // per event: each watcher polls the RPC on its own.
  useWatchContractEvent({
    address: multiSigAddress,
    abi: adminEventsAbi,
    enabled,
    onLogs: (logs) => {
      let ownersChanged = false
      logs.forEach((log: any) => {
        switch (log.eventName) {
          case 'OwnerAdded': {
            ownersChanged = true
            const owner = String(log.args?.owner ?? '')
            if (owner) handleOwnerAdded(owner)
            break
          }
          case 'OwnerRemoved': {
            ownersChanged = true
            const owner = String(log.args?.owner ?? '')
            if (owner) handleOwnerRemoved(owner)
            break
          }
          case 'ThresholdChanged': {
            const threshold = log.args?.threshold
            if (threshold == null) break
            applyPatch((stored) => (stored.threshold === Number(threshold) ? null : { threshold: Number(threshold) }))
            break
          }
        }
      })
      if (ownersChanged) onOwnersChanged?.()
    }
  })
}

export default useAdminEventSync
