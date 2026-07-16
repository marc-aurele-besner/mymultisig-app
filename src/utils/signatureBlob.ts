import { encodeAbiParameters } from 'viem'

import { isModernWallet } from './contractVersions'

// Pre-0.5.0 wallets consume signatures as flat 65-byte r||s||v chunks
// concatenated in signing order. 0.5.0 wallets consume an ABI-encoded
// (address owner, bytes sig)[] instead — the owner is explicit per entry, and
// `sig` may be a 65-byte ECDSA signature (EOA owner) or an EIP-1271 blob the
// wallet staticcalls the owner contract with (nested-wallet owner).

const OWNER_SIG_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'owner', type: 'address' },
      { name: 'sig', type: 'bytes' }
    ]
  }
] as const

export const combineSignatures = (
  walletVersion: string | undefined,
  ownerSigners: string[],
  signatures: string[]
): `0x${string}` => {
  if (signatures.length === 0) return '0x'
  if (!isModernWallet(walletVersion))
    return signatures.reduce((blob, sig) => blob + sig.replace(/^0x/, ''), '0x') as `0x${string}`
  return encodeAbiParameters(OWNER_SIG_TUPLE, [
    signatures.map((sig, i) => ({
      owner: ownerSigners[i] as `0x${string}`,
      sig: sig as `0x${string}`
    }))
  ])
}
