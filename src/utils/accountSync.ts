import { v4 } from 'uuid'

import { Contract } from '../models/Contracts'
import { MultiSig, MultiSigFactory } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import useContracts from '../states/contracts'
import shippedFactories from '../constants/multiSigFactory'
import {
  addFactory,
  createMultiSigWallet,
  listFactories,
  listMultiSigWallets,
  listSavedContracts,
  upsertSavedContract
} from './api'

// Account-scoped data that must survive the browser: wallets, call-builder
// contracts, and user-deployed factories. Same contract as the address book
// sync: local Zustand stores render; remote writes are fire-and-forget; the
// initial sync pulls remote rows in and pushes local-only ones up.

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const keyOf = (e: { chainId: number; address: string }) => `${e.chainId}-${e.address.toLowerCase()}`

// --- Wallets -------------------------------------------------------------

export const syncWalletsWithRemote = async (ownerAddress: string, chainId: number) => {
  try {
    const response = await listMultiSigWallets(ownerAddress)
    const remote = Array.isArray(response?.content) ? (response.content as MultiSig[]) : null
    if (remote == null) return
    const { multiSigs, addMultiSig } = useMultiSigs.getState()
    const localKeys = new Set(multiSigs.map(keyOf))
    const remoteKeys = new Set(remote.map(keyOf))
    remote.filter((w) => !localKeys.has(keyOf(w))).forEach((w) => addMultiSig(w))
    // Wallets saved before the read-back sync existed (or while offline).
    for (const w of multiSigs.filter((w) => !remoteKeys.has(keyOf(w)))) {
      try {
        await createMultiSigWallet(w)
      } catch {
        // Best-effort; the local store already has the change.
      }
    }
  } catch {
    // Offline or DB unavailable; localStorage keeps working.
  }
}

// --- Saved contracts (call builder) --------------------------------------

export const persistSavedContract = (contract: Contract, ownerAddress: string | undefined) => {
  if (ownerAddress == null || !isAddress(contract.address)) return
  void upsertSavedContract({
    ownerAddress,
    chainId: contract.chainId,
    chainName: contract.chainName,
    address: contract.address,
    name: contract.name,
    abi: contract.abi
  }).catch(() => {
    // DB persistence is best-effort; the local store already has the change.
  })
}

export const syncSavedContractsWithRemote = async (ownerAddress: string, chainId: number) => {
  try {
    const response = await listSavedContracts(ownerAddress)
    const remote = Array.isArray(response?.content) ? response.content : null
    if (remote == null) return
    const { contracts, addContract } = useContracts.getState()
    const localKeys = new Set(contracts.filter((c) => isAddress(c.address)).map(keyOf))
    const remoteKeys = new Set(remote.map(keyOf))
    remote
      .filter((c: { chainId: number; address: string }) => !localKeys.has(keyOf(c)))
      .forEach((c: { id: string; chainId: number; chainName: string; address: string; name: string; abi: [] }) =>
        addContract({
          chainId: c.chainId,
          chainName: c.chainName,
          id: c.id || v4(),
          name: c.name,
          address: c.address as `0x${string}`,
          creator: ownerAddress as `0x${string}`,
          abi: c.abi ?? [],
          isMultiSig: false,
          isPublic: false,
          isVerified: false,
          isWhitelisted: false,
          isChainSpecific: false,
          isWalletSpecific: true
        })
      )
    contracts
      .filter((c) => isAddress(c.address) && !c.isMultiSig && !remoteKeys.has(keyOf(c)))
      .forEach((c) => persistSavedContract(c, ownerAddress))
  } catch {
    // Offline or DB unavailable; localStorage keeps working.
  }
}

// --- User-deployed factories ----------------------------------------------

const isShippedFactory = (factory: { chainId: number; address: string }) =>
  shippedFactories.some(
    (f) => f.chainId === factory.chainId && f.address.toLowerCase() === factory.address.toLowerCase()
  )

export const persistFactory = (factory: MultiSigFactory, ownerAddress: string | undefined) => {
  if (ownerAddress == null || isShippedFactory(factory)) return
  void addFactory({
    ownerAddress,
    chainId: factory.chainId,
    chainName: factory.chainName,
    address: factory.address,
    name: factory.name,
    version: factory.version
  }).catch(() => {
    // Best-effort; the local store already has the change.
  })
}

export const syncFactoriesWithRemote = async (ownerAddress: string, chainId: number) => {
  try {
    const response = await listFactories(ownerAddress)
    const remote = Array.isArray(response?.content) ? (response.content as MultiSigFactory[]) : null
    if (remote == null) return
    const { multiSigFactory, addMultiSigFactory } = useMultiSigs.getState()
    const localKeys = new Set(multiSigFactory.map(keyOf))
    const remoteKeys = new Set(remote.map(keyOf))
    remote.filter((f) => !localKeys.has(keyOf(f))).forEach((f) => addMultiSigFactory(f))
    multiSigFactory
      .filter((f) => !isShippedFactory(f) && !remoteKeys.has(keyOf(f)))
      .forEach((f) => persistFactory(f, ownerAddress))
  } catch {
    // Offline or DB unavailable; localStorage keeps working.
  }
}
