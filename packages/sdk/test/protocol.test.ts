import { describe, expect, it } from 'vitest'
import { decodeAbiParameters, encodeFunctionData, erc20Abi, hashTypedData, maxUint256, type Abi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import {
  buildCreateMultiSigCall,
  buildExecTransactionCall,
  buildTransactionTypedData,
  combineSignatures,
  ENTRY_POINT_V07_ADDRESS,
  isModernWallet,
  type ExecTransactionArgs
} from '../src/protocol'
import { requestTypedData, signRequest, verifyRequestSignatures } from '../src/signing'
import { describeCall } from '../src/decode'

// Well-known anvil/hardhat dev keys — never funded on a real network.
const ownerA = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
const ownerB = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')
const stranger = privateKeyToAccount('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a')

const WALLET = '0x1111111111111111111111111111111111111111' as const
const TO = '0x2222222222222222222222222222222222222222' as const

const args: ExecTransactionArgs = {
  to: TO,
  value: '1000',
  data: '0x',
  txnGas: '35000',
  signatures: '0x'
}

const domain = { name: 'Treasury', version: '0.5.0', chainId: 11155111, verifyingContract: WALLET }

describe('versions', () => {
  it('splits legacy and 0.5.0+ wallets', () => {
    expect(isModernWallet('0.1.3')).toBe(false)
    expect(isModernWallet('0.0.7')).toBe(false)
    expect(isModernWallet('0.5.0')).toBe(true)
    expect(isModernWallet('0.5.1')).toBe(true)
    expect(isModernWallet(undefined)).toBe(false)
  })
})

describe('buildTransactionTypedData', () => {
  it('uses the 5-field struct on legacy wallets', () => {
    const td = buildTransactionTypedData({ domain: { ...domain, version: '0.1.3' }, args, nonce: 3n, walletVersion: '0.1.3', isExtended: true })
    expect(td.types.Transaction.map((f) => f.name)).toEqual(['to', 'value', 'data', 'gas', 'nonce'])
    expect(td.message).toEqual({ to: TO, value: 1000n, data: '0x', gas: 35000n, nonce: 3n })
  })

  it('adds validUntil on 0.5.0 base wallets', () => {
    const td = buildTransactionTypedData({ domain, args: { ...args, validUntil: '1900000000' }, nonce: 0n, walletVersion: '0.5.0', isExtended: false })
    expect(td.types.Transaction.map((f) => f.name)).toEqual(['to', 'value', 'data', 'gas', 'nonce', 'validUntil'])
    expect(td.message.validUntil).toBe(1900000000n)
  })

  it('adds validUntil + operation on 0.5.0 Extended wallets', () => {
    const td = buildTransactionTypedData({ domain, args: { ...args, operation: '1' }, nonce: 0n, walletVersion: '0.5.0', isExtended: true })
    expect(td.types.Transaction.map((f) => f.name)).toEqual(['to', 'value', 'data', 'gas', 'nonce', 'validUntil', 'operation'])
    expect(td.message.operation).toBe(1)
    expect(td.message.validUntil).toBe(0n)
  })

  it('produces stable digests (regression vectors)', () => {
    const legacy = buildTransactionTypedData({ domain: { ...domain, version: '0.1.3' }, args, nonce: 3n, walletVersion: '0.1.3', isExtended: false })
    const modern = buildTransactionTypedData({ domain, args, nonce: 3n, walletVersion: '0.5.0', isExtended: false })
    const extended = buildTransactionTypedData({ domain, args, nonce: 3n, walletVersion: '0.5.0', isExtended: true })
    const digests = [legacy, modern, extended].map((td) => hashTypedData(td as Parameters<typeof hashTypedData>[0]))
    expect(new Set(digests).size).toBe(3)
    expect(digests).toMatchSnapshot()
  })
})

describe('combineSignatures', () => {
  const sigA = `0x${'a'.repeat(130)}`
  const sigB = `0x${'b'.repeat(130)}`

  it('concatenates on legacy wallets', () => {
    expect(combineSignatures('0.1.3', [ownerA.address, ownerB.address], [sigA, sigB])).toBe(`0x${'a'.repeat(130)}${'b'.repeat(130)}`)
  })

  it('ABI-encodes (owner, sig)[] on 0.5.0 wallets', () => {
    const blob = combineSignatures('0.5.0', [ownerA.address, ownerB.address], [sigA, sigB])
    const [decoded] = decodeAbiParameters(
      [{ type: 'tuple[]', components: [{ name: 'owner', type: 'address' }, { name: 'sig', type: 'bytes' }] }],
      blob
    )
    expect(decoded.map((d) => d.owner)).toEqual([ownerA.address, ownerB.address])
    expect(decoded.map((d) => d.sig)).toEqual([sigA, sigB])
  })

  it('returns 0x with no signatures', () => {
    expect(combineSignatures('0.5.0', [], [])).toBe('0x')
  })
})

describe('buildExecTransactionCall', () => {
  const cases: [string, string, boolean, boolean, string, number][] = [
    ['legacy', '0.1.3', false, false, 'address,uint256,bytes,uint256,bytes', 5],
    ['legacy pinned', '0.1.3', true, true, 'address,uint256,bytes,uint256,uint256,bytes', 6],
    ['0.5.0 base', '0.5.0', false, false, 'address,uint256,bytes,uint256,uint256,bytes', 6],
    ['0.5.0 extended', '0.5.0', true, false, 'address,uint256,bytes,uint256,uint256,uint8,bytes', 7],
    ['0.5.0 extended pinned', '0.5.0', true, true, 'address,uint256,bytes,uint256,uint256,uint256,uint8,bytes', 8]
  ]
  it.each(cases)('%s', (_label, version, isExtended, pinned, inputTypes, argCount) => {
    const call = buildExecTransactionCall({
      args: { ...args, ...(pinned ? { txnNonce: '7' } : {}) },
      walletVersion: version,
      isExtended
    })
    expect(call.inputTypes).toBe(inputTypes)
    expect(call.args).toHaveLength(argCount)
    const overloads = call.abi.filter((i) => i.type === 'function' && i.name === 'execTransaction')
    expect(overloads).toHaveLength(1)
    // The encoded call must be accepted by viem with exactly this overload.
    expect(() => encodeFunctionData({ abi: call.abi, functionName: 'execTransaction', args: call.args as never })).not.toThrow()
  })
})

describe('buildCreateMultiSigCall', () => {
  const base = { contractName: 'Treasury', owners: [ownerA.address, ownerB.address], threshold: 2 }
  it('creates simple wallets', () => {
    const call = buildCreateMultiSigCall({ ...base, factoryVersion: '0.5.0' })
    expect(call.functionName).toBe('createMultiSig')
    expect(call.args).toEqual(['Treasury', base.owners, 2])
  })
  it('passes the EntryPoint to 0.5.0 Extended creation', () => {
    const call = buildCreateMultiSigCall({ ...base, walletType: 'extended', isOnlyOwnerRequest: true, factoryVersion: '0.5.0' })
    expect(call.functionName).toBe('createMyMultiSigExtended')
    expect(call.args).toEqual(['Treasury', base.owners, 2, true, ENTRY_POINT_V07_ADDRESS])
  })
  it('uses the deterministic path with a salt on 0.5.0 factories', () => {
    const salt = `0x${'01'.repeat(32)}` as const
    expect(buildCreateMultiSigCall({ ...base, salt, factoryVersion: '0.5.0' }).functionName).toBe('createDeterministicMultiSig')
    expect(buildCreateMultiSigCall({ ...base, salt, walletType: 'advanced', factoryVersion: '0.5.0' }).functionName).toBe(
      'createDeterministicMyMultiSigAdvanced'
    )
  })
  it('falls back to the legacy 4-arg Extended shape on old factories (and ignores salt)', () => {
    const call = buildCreateMultiSigCall({ ...base, walletType: 'extended', salt: `0x${'01'.repeat(32)}`, factoryVersion: '0.1.1' })
    expect(call.functionName).toBe('createMyMultiSigExtended')
    expect(call.args).toEqual(['Treasury', base.owners, 2, false])
  })
})

describe('signing', () => {
  const wallet = {
    chainId: 11155111,
    address: WALLET,
    name: 'Treasury',
    version: '0.5.0',
    nonce: 4n,
    walletType: 'extended' as const
  }

  it('signs and verifies owner signatures, flagging strangers and swaps', async () => {
    const td = requestTypedData(wallet, args)
    const sigA = await signRequest(ownerA, td)
    const sigB = await signRequest(ownerB, td)
    const sigX = await signRequest(stranger, td)
    const owners = [ownerA.address, ownerB.address]
    const checks = await verifyRequestSignatures(
      td,
      [ownerA.address, ownerB.address, stranger.address, ownerA.address],
      [sigA, sigB, sigX, sigB],
      owners
    )
    expect(checks.map((c) => c.status)).toEqual(['valid', 'valid', 'not-owner', 'mismatch'])
  })

  it('binds the pinned nonce instead of the wallet nonce', () => {
    expect(requestTypedData(wallet, args).message.nonce).toBe(4n)
    expect(requestTypedData(wallet, { ...args, txnNonce: '9' }).message.nonce).toBe(9n)
  })

  it('marks non-ECDSA blobs as unverifiable', async () => {
    const checks = await verifyRequestSignatures(requestTypedData(wallet, args), [ownerA.address], ['0x1234'], undefined)
    expect(checks[0].status).toBe('unverifiable')
  })
})

describe('describeCall', () => {
  it('flags owner changes on self-calls', () => {
    const data = encodeFunctionData({ abi: MyMultiSigExtended as Abi, functionName: 'addOwner', args: [ownerB.address] })
    const decoded = describeCall(WALLET, { to: WALLET, value: '0', data })
    expect(decoded.kind).toBe('wallet-admin')
    expect(decoded.functionName).toBe('addOwner')
    expect(decoded.warnings.join(' ')).toMatch(/control/)
  })

  it('flags unlimited ERC-20 approvals and delegatecall', () => {
    const data = encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [TO, maxUint256] })
    const decoded = describeCall(WALLET, { to: TO, value: '0', data, operation: '1' })
    expect(decoded.kind).toBe('erc20')
    expect(decoded.warnings).toHaveLength(2)
  })

  it('describes native transfers', () => {
    expect(describeCall(WALLET, { to: TO, value: '1000000000000000000', data: '0x' }).summary).toBe(
      `Transfer 1 native token to ${TO}`
    )
  })
})
