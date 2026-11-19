import { encodeAbiParameters, hashMessage, hashTypedData, isHex, toHex } from 'viem'

import type { TransactionTypedDataInput } from './typedData'

// EIP-1271 message signing (0.5.0+ wallets).
//
// A verifier calls isValidSignature(dataHash, signature) on the wallet. The
// wallet never checks anything against dataHash directly: it looks at the
// wallet-bound hash getMessageHash(abi.encode(dataHash)), the EIP-712 hash of
// MyMultiSigMessage(bytes message) under the wallet's domain. That hash is
//   - the key the on-chain registry uses (signMessage(abi.encode(dataHash))
//     makes isValidSignature(dataHash, '0x') return the magic value), and
//   - on 0.5.1+ wallets, the hash each owner signs for an off-chain vote
//     (see hasWalletBoundEip1271).

export type MessageTypedData = {
  domain: TransactionTypedDataInput['domain']
  types: { MyMultiSigMessage: { name: string; type: string }[] }
  primaryType: 'MyMultiSigMessage'
  message: { message: `0x${string}` }
}

const BYTES32 = /^0x[0-9a-fA-F]{64}$/

// The message bytes the wallet binds for a 32-byte digest: abi.encode(dataHash).
export const eip1271Message = (dataHash: `0x${string}`): `0x${string}` =>
  encodeAbiParameters([{ type: 'bytes32' }], [dataHash])

// The digest a verifier passes to isValidSignature for user input:
// - a 32-byte hex value is taken as the digest itself (a Permit2 or order
//   hash, a parent wallet's transaction hash);
// - anything else is hashed the way personal_sign / SIWE verifiers do
//   (EIP-191), as raw bytes when it is 0x-prefixed hex, as text otherwise.
export const eip1271DigestFor = (input: string): `0x${string}` => {
  if (BYTES32.test(input)) return input as `0x${string}`
  return isHex(input) ? hashMessage({ raw: input }) : hashMessage(input)
}

export const buildMessageTypedData = ({
  domain,
  message
}: {
  domain: TransactionTypedDataInput['domain']
  message: `0x${string}`
}): MessageTypedData => ({
  domain,
  types: { MyMultiSigMessage: [{ name: 'message', type: 'bytes' }] },
  primaryType: 'MyMultiSigMessage' as const,
  message: { message }
})

// What an owner signs so the wallet accepts their vote in
// isValidSignature(dataHash, votes) on a 0.5.1+ wallet. Also what the owners
// of a nested wallet sign when the parent wallet asks it to validate a hash.
export const buildEip1271VoteTypedData = ({
  domain,
  dataHash
}: {
  domain: TransactionTypedDataInput['domain']
  dataHash: `0x${string}`
}): MessageTypedData => buildMessageTypedData({ domain, message: eip1271Message(dataHash) })

// Same value as the wallet's getMessageHash(message).
export const walletMessageHash = (domain: TransactionTypedDataInput['domain'], message: `0x${string}`): `0x${string}` =>
  hashTypedData(buildMessageTypedData({ domain, message }) as Parameters<typeof hashTypedData>[0])

// Plain text to bytes the same way the app always has: 0x strings are raw.
export const messageBytes = (input: string): `0x${string}` => (isHex(input) ? input : toHex(input))
