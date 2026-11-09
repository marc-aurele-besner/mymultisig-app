import type { Abi } from 'viem'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

import { LegacyCreateExtendedFragment } from './legacyAbi'
import { isExtendedWallet, type WalletType } from './types'
import { isModernFactory } from './versions'

// Canonical ERC-4337 EntryPoint v0.7 — same address on every EVM chain. 0.5.0
// factories pin it into Extended/Advanced wallets at creation.
export const ENTRY_POINT_V07_ADDRESS = '0x0000000071727de22e5e9d8bde0dfec0ceb6a7d7' as const

export type CreateMultiSigInput = {
  contractName: string
  owners: string[]
  threshold: number
  walletType?: WalletType
  isOnlyOwnerRequest?: boolean
  // 0.5.0 factories only: bytes32 CREATE2 salt. When set, creation goes
  // through createDeterministic* so the same creator + salt + constructor
  // arguments yield the same wallet address on every chain.
  salt?: `0x${string}`
  // The factory's version(); decides between the 0.5.0 and legacy shapes.
  factoryVersion: string | undefined
}

export type CreateMultiSigCall = {
  abi: Abi
  functionName: string
  args: readonly unknown[]
}

// 0.5.0 factories take the ERC-4337 EntryPoint on the Extended/Advanced
// create calls; pre-0.5.0 factories keep the 4-arg shape, which the 0.5.0
// package ABI no longer carries (vendored legacy fragment).
export const buildCreateMultiSigCall = (input: CreateMultiSigInput): CreateMultiSigCall => {
  const isExtended = isExtendedWallet(input.walletType)
  const modernFactory = isModernFactory(input.factoryVersion)
  const deterministic = modernFactory && input.salt != null
  const abi =
    isExtended && !modernFactory
      ? ([
          ...(MyMultiSigFactory as Abi).filter(
            (item) => !(item.type === 'function' && item.name === 'createMyMultiSigExtended')
          ),
          ...(LegacyCreateExtendedFragment as unknown as Abi)
        ] as Abi)
      : (MyMultiSigFactory as Abi)
  const functionName = isExtended
    ? modernFactory && input.walletType === 'advanced'
      ? deterministic
        ? 'createDeterministicMyMultiSigAdvanced'
        : 'createMyMultiSigAdvanced'
      : deterministic
        ? 'createDeterministicMyMultiSigExtended'
        : 'createMyMultiSigExtended'
    : deterministic
      ? 'createDeterministicMultiSig'
      : 'createMultiSig'
  const args = isExtended
    ? [
        input.contractName,
        input.owners,
        input.threshold,
        input.isOnlyOwnerRequest ?? false,
        ...(modernFactory ? [ENTRY_POINT_V07_ADDRESS] : []),
        ...(deterministic ? [input.salt] : [])
      ]
    : [input.contractName, input.owners, input.threshold, ...(deterministic ? [input.salt] : [])]
  return { abi, functionName, args }
}
