import { describe, expect, it } from 'vitest'
import {
  concat,
  encodeAbiParameters,
  hashMessage,
  hashTypedData,
  keccak256,
  recoverTypedDataAddress,
  toBytes,
  toHex
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  buildEip1271VoteTypedData,
  eip1271DigestFor,
  eip1271Message,
  hasWalletBoundEip1271,
  walletMessageHash
} from '../src/protocol'

// Well-known anvil/hardhat dev key — never funded on a real network.
const owner = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

const WALLET_A = '0x1111111111111111111111111111111111111111' as const
const WALLET_B = '0x3333333333333333333333333333333333333333' as const
const domain = { name: 'Treasury', version: '0.5.2', chainId: 11155111, verifyingContract: WALLET_A }
const DIGEST = keccak256(toBytes('Permit2 PermitSingle digest'))

// The contract's getMessageHash(message), written out by hand:
// keccak256(0x1901 || domainSeparator || keccak256(abi.encode(MSG_TYPEHASH, keccak256(message)))).
const manualMessageHash = (verifyingContract: `0x${string}`, message: `0x${string}`) => {
  const domainTypehash = keccak256(
    toBytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
  )
  const domainSeparator = keccak256(
    encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'bytes32' }, { type: 'bytes32' }, { type: 'uint256' }, { type: 'address' }],
      [
        domainTypehash,
        keccak256(toBytes(domain.name)),
        keccak256(toBytes(domain.version)),
        BigInt(domain.chainId),
        verifyingContract
      ]
    )
  )
  const structHash = keccak256(
    encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'bytes32' }],
      [keccak256(toBytes('MyMultiSigMessage(bytes message)')), keccak256(message)]
    )
  )
  return keccak256(concat(['0x1901', domainSeparator, structHash]))
}

describe('hasWalletBoundEip1271', () => {
  it('is false on 0.5.1 and older wallets, true from 0.5.2', () => {
    expect(hasWalletBoundEip1271('0.1.3')).toBe(false)
    expect(hasWalletBoundEip1271('0.5.0')).toBe(false)
    expect(hasWalletBoundEip1271('0.5.1')).toBe(false)
    expect(hasWalletBoundEip1271('0.5.2')).toBe(true)
    expect(hasWalletBoundEip1271('0.6.0')).toBe(true)
    expect(hasWalletBoundEip1271(undefined)).toBe(false)
  })
})

describe('EIP-1271 vote typed data', () => {
  it('binds abi.encode(dataHash) like the contract', () => {
    expect(eip1271Message(DIGEST)).toBe(encodeAbiParameters([{ type: 'bytes32' }], [DIGEST]))
    const td = buildEip1271VoteTypedData({ domain, dataHash: DIGEST })
    expect(td.primaryType).toBe('MyMultiSigMessage')
    expect(td.types.MyMultiSigMessage).toEqual([{ name: 'message', type: 'bytes' }])
    const hash = hashTypedData(td as Parameters<typeof hashTypedData>[0])
    expect(hash).toBe(manualMessageHash(WALLET_A, eip1271Message(DIGEST)))
    expect(walletMessageHash(domain, eip1271Message(DIGEST))).toBe(hash)
  })

  it('gives a different hash on every wallet, so a vote cannot be replayed on a sibling', () => {
    const a = walletMessageHash(domain, eip1271Message(DIGEST))
    const b = walletMessageHash({ ...domain, verifyingContract: WALLET_B }, eip1271Message(DIGEST))
    expect(a).not.toBe(b)
    expect(a).not.toBe(DIGEST)
  })

  it('produces a signature that recovers to the owner over the wallet-bound hash', async () => {
    const td = buildEip1271VoteTypedData({ domain, dataHash: DIGEST })
    const signature = await owner.signTypedData(td as Parameters<typeof owner.signTypedData>[0])
    const recovered = await recoverTypedDataAddress({
      ...td,
      signature
    } as unknown as Parameters<typeof recoverTypedDataAddress>[0])
    expect(recovered).toBe(owner.address)
  })
})

describe('eip1271DigestFor', () => {
  it('takes a 32-byte hex value as the digest', () => {
    expect(eip1271DigestFor(DIGEST)).toBe(DIGEST)
  })

  it('hashes text and other bytes with EIP-191, as SIWE verifiers do', () => {
    expect(eip1271DigestFor('Sign in to example.com')).toBe(hashMessage('Sign in to example.com'))
    const raw = toHex('raw bytes')
    expect(eip1271DigestFor(raw)).toBe(hashMessage({ raw }))
  })
})
