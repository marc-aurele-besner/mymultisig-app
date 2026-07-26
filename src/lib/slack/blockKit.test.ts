import type { MultiSigTransactionRequest } from '../../models/MultiSigs'
import { newRequestMessage } from './blockKit'
import type { NewRequestInput } from '../notifications/dispatcher'

// Pure-shape tests for newRequestMessage. Mirrors the existing
// crypto.test.ts pattern: no DB, no HTTP — just verify the builder emits
// the right Block Kit shape for the platform.

const baseRequest: MultiSigTransactionRequest = {
  id: '7f3c1b2e-9a4d-4e8b-9c2f-1a2b3c4d5e6f',
  multiSigAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  request: { to: '0xvictim', value: '1000000000000000000', data: '0x', operation: 0 },
  description: 'Send 1 ETH to treasury',
  submitter: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  signatures: ['0xsignatureone'],
  ownerSigners: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045'],
  dateSubmitted: '2026-07-26T00:00:00Z',
  dateExecuted: '',
  isActive: true,
  isExecuted: false,
  isCancelled: false,
  isConfirmed: false,
  isSuccessful: false
}

const baseInput: NewRequestInput = {
  request: baseRequest,
  chainId: 1,
  chainName: 'Mainnet',
  threshold: 3,
  explorerUrl: 'https://etherscan.io'
}

describe('newRequestMessage', () => {
  it('is in_channel so the whole channel sees the new request', () => {
    const msg = newRequestMessage(baseInput)
    expect(msg.response_type).toBe('in_channel')
  })

  it('mentions chain, description, threshold, submitter, and multisig', () => {
    const msg = newRequestMessage(baseInput)
    const flat = JSON.stringify(msg)
    expect(flat).toContain('Mainnet')
    expect(flat).toContain('Send 1 ETH to treasury')
    expect(flat).toContain('1/3 signatures')
    expect(flat).toContain('0xd8da…6045')
    expect(flat).toContain(baseRequest.multiSigAddress)
  })

  it('includes a View request button pointing at the request page', () => {
    const msg = newRequestMessage(baseInput)
    const actions = msg.blocks.find((b: any) => b.type === 'actions')
    expect(actions).toBeDefined()
    const viewBtn = actions.elements.find((e: any) => e.text?.text === 'View request')
    expect(viewBtn).toBeDefined()
    expect(viewBtn.url).toContain(`/request/${baseRequest.id}`)
  })

  it('includes a View on explorer button when explorerUrl is set', () => {
    const msg = newRequestMessage(baseInput)
    const actions = msg.blocks.find((b: any) => b.type === 'actions')
    const explorerBtn = actions.elements.find((e: any) => e.text?.text === 'View on explorer')
    expect(explorerBtn).toBeDefined()
    expect(explorerBtn.url).toContain('/address/')
    expect(explorerBtn.url).toContain(baseRequest.multiSigAddress)
  })

  it('omits the explorer button when explorerUrl is null', () => {
    const msg = newRequestMessage({ ...baseInput, explorerUrl: null })
    const actions = msg.blocks.find((b: any) => b.type === 'actions')
    const explorerBtn = actions.elements.find((e: any) => e.text?.text === 'View on explorer')
    expect(explorerBtn).toBeUndefined()
  })

  it('falls back to "?" for threshold and "unknown chain" when chainName/threshold missing', () => {
    const msg = newRequestMessage({ ...baseInput, chainName: null, threshold: null })
    const flat = JSON.stringify(msg)
    expect(flat).toContain('unknown chain')
    expect(flat).toContain('1/? signatures')
  })
})