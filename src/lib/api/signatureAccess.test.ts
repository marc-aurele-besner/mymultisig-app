jest.mock('../db/neon', () => ({ getDb: () => ({}) }))

import type { MultiSigTransactionRequest } from '../../models/MultiSigs'
import type { Caller } from './middleware'
import {
  canReadSignatures,
  checkSignaturesPatch,
  keepSignatureBlob,
  redactSignatures,
  withSignatureAccess
} from './signatureAccess'

const WALLET = '0x00000000000000000000000000000000000000aa' as const
const OWNER_A = '0x000000000000000000000000000000000000000a'
const OWNER_B = '0x000000000000000000000000000000000000000b'
const STRANGER = '0x00000000000000000000000000000000000000ff'

const siwe = (address: string): Caller => ({ address, via: 'siwe', scopes: 'all', walletAllowlist: [] })

const request: MultiSigTransactionRequest = {
  id: '6f1c1d2e-0000-4000-8000-000000000001',
  multiSigAddress: WALLET,
  request: { to: OWNER_B, value: '1', data: '0x', txnGas: '50000', signatures: '0xblob' },
  description: 'send 1 wei',
  submitter: OWNER_A,
  signatures: ['0xsigA', '0xsigB'],
  ownerSigners: [OWNER_A, OWNER_B],
  dateSubmitted: '1',
  dateExecuted: '',
  isActive: true,
  isExecuted: false,
  isCancelled: false,
  isConfirmed: false,
  isSuccessful: false,
  txnNonce: '0',
  dateCancelled: '',
  cancelledBy: ''
}

describe('canReadSignatures', () => {
  const owners = [OWNER_A.toUpperCase().replace('0X', '0x'), OWNER_B]

  it('refuses anonymous readers', () => {
    expect(canReadSignatures(null, WALLET, owners, request)).toBe(false)
  })

  it('allows an owner, case-insensitively', () => {
    expect(canReadSignatures(siwe(OWNER_A), WALLET, owners, request)).toBe(true)
  })

  it('refuses a signed-in wallet that is not an owner', () => {
    expect(canReadSignatures(siwe(STRANGER), WALLET, owners, request)).toBe(false)
  })

  it('refuses an owner API key restricted to other wallets', () => {
    const key: Caller = { address: OWNER_A, via: 'apikey', scopes: ['read'], walletAllowlist: [STRANGER] }
    expect(canReadSignatures(key, WALLET, owners, request)).toBe(false)
  })

  it('falls back to the submitter and signers when the wallet has no stored owners', () => {
    expect(canReadSignatures(siwe(OWNER_B), WALLET, [], request)).toBe(true)
    expect(canReadSignatures(siwe(STRANGER), WALLET, null, request)).toBe(false)
  })
})

describe('redactSignatures / withSignatureAccess', () => {
  it('drops both signature copies and keeps the signer list', () => {
    const redacted = redactSignatures(request)
    expect(redacted.signatures).toEqual([])
    expect(redacted.request.signatures).toBe('')
    expect(redacted.ownerSigners).toEqual([OWNER_A, OWNER_B])
    expect(redacted.signaturesRedacted).toBe(true)
    expect(request.signatures).toHaveLength(2)
  })

  it('serves owners the full row', () => {
    expect(withSignatureAccess(request, siwe(OWNER_B), [OWNER_A, OWNER_B])).toBe(request)
    expect(withSignatureAccess(request, null, [OWNER_A, OWNER_B]).signaturesRedacted).toBe(true)
  })
})

describe('checkSignaturesPatch', () => {
  const existing = { signatures: ['0xsigA'], ownerSigners: [OWNER_A], request: request.request }

  it('accepts an append and a reset', () => {
    expect(checkSignaturesPatch(existing, { signatures: ['0xsigA', '0xsigB'], ownerSigners: [OWNER_A, OWNER_B] })).toBe(
      null
    )
    expect(checkSignaturesPatch(existing, { signatures: [], ownerSigners: [] })).toBe(null)
    expect(checkSignaturesPatch(existing, { isExecuted: true })).toBe(null)
  })

  it('refuses a patch built from a redacted copy', () => {
    expect(checkSignaturesPatch(existing, { signatures: ['0xsigB'], ownerSigners: [OWNER_A, OWNER_B] })).toMatch(
      /only be added to/
    )
    expect(checkSignaturesPatch(existing, { signatures: ['0xsigA'], ownerSigners: [OWNER_B] })).toMatch(
      /only be added to/
    )
  })

  it('refuses non-array values', () => {
    expect(checkSignaturesPatch(existing, { signatures: '0xsigA' })).toMatch(/must be an array/)
  })
})

describe('keepSignatureBlob', () => {
  const existing = { signatures: ['0xsigA'], ownerSigners: [OWNER_A], request: request.request }

  it('keeps the stored blob when the patch carries an empty one', () => {
    const next = keepSignatureBlob(existing, {
      request: { ...request.request, signatures: '', executionTxHash: '0x1' }
    })
    expect(next.signatures).toBe('0xblob')
    expect(next.executionTxHash).toBe('0x1')
  })

  it('lets a reset clear the blob', () => {
    expect(
      keepSignatureBlob(existing, { request: { ...request.request, signatures: '' }, signatures: [] }).signatures
    ).toBe('')
  })

  it('uses the stored request when the patch has none', () => {
    expect(keepSignatureBlob(existing, { isExecuted: true })).toBe(existing.request)
  })
})
