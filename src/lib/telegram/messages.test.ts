import type { MultiSigTransactionRequest } from '../../models/MultiSigs'
import { newRequestPayload } from './messages'
import type { NewRequestInput } from '../notifications/dispatcher'

// Pure-shape tests for newRequestPayload. Mirrors src/lib/slack/blockKit.test.ts.

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

describe('newRequestPayload', () => {
  it('is a sendMessage payload with HTML parse_mode', () => {
    const payload = newRequestPayload(baseInput)
    expect(payload.method).toBe('sendMessage')
    expect(payload.parse_mode).toBe('HTML')
    // chat_id is a placeholder; the dispatcher overrides per binding.
    expect(payload.chat_id).toBe(0)
  })

  it('mentions chain, description, threshold, submitter, and multisig in the text', () => {
    const payload = newRequestPayload(baseInput)
    expect(payload.text).toContain('Mainnet')
    expect(payload.text).toContain('Send 1 ETH to treasury')
    expect(payload.text).toContain('1/3 signatures')
    expect(payload.text).toContain('0xd8da…6045')
    expect(payload.text).toContain(baseRequest.multiSigAddress)
  })

  it('escapes HTML in user-supplied fields (defense-in-depth)', () => {
    const payload = newRequestPayload({
      ...baseInput,
      chainName: '<script>'
    })
    // '<' and '>' must be HTML-escaped to '&lt;' and '&gt;' so a hostile
    // chain name can't inject tags. Telegram is forgiving about broken
    // HTML, but we still escape.
    expect(payload.text).not.toContain('<script>')
    expect(payload.text).toContain('&lt;script&gt;')
  })

  it('includes a View request inline button', () => {
    const payload = newRequestPayload(baseInput)
    const buttons = payload.reply_markup?.inline_keyboard?.[0] ?? []
    const viewBtn = buttons.find((b) => b.text === 'View request')
    expect(viewBtn).toBeDefined()
    expect(viewBtn?.url).toContain(`/request/${baseRequest.id}`)
  })

  it('includes a View on explorer inline button when explorerUrl is set', () => {
    const payload = newRequestPayload(baseInput)
    const buttons = payload.reply_markup?.inline_keyboard?.[0] ?? []
    const explorerBtn = buttons.find((b) => b.text === 'View on explorer')
    expect(explorerBtn).toBeDefined()
    expect(explorerBtn?.url).toContain('/address/')
  })

  it('omits the explorer button when explorerUrl is null', () => {
    const payload = newRequestPayload({ ...baseInput, explorerUrl: null })
    const buttons = payload.reply_markup?.inline_keyboard?.[0] ?? []
    const explorerBtn = buttons.find((b) => b.text === 'View on explorer')
    expect(explorerBtn).toBeUndefined()
  })

  it('falls back to "?" and "unknown chain" when chainName/threshold missing', () => {
    const payload = newRequestPayload({ ...baseInput, chainName: null, threshold: null })
    expect(payload.text).toContain('unknown chain')
    expect(payload.text).toContain('1/? signatures')
  })
})