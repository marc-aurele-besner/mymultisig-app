import type { MultiSigTransactionRequest } from '../../models/MultiSigs'
import { newRequestEmbed } from './embeds'
import type { NewRequestInput } from '../notifications/dispatcher'

// Pure-shape tests for newRequestEmbed. Mirrors src/lib/slack/blockKit.test.ts.

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

describe('newRequestEmbed', () => {
  it('wraps the embed in a type-4 interaction response', () => {
    const embed = newRequestEmbed(baseInput)
    expect(embed.type).toBe(4)
    expect(Array.isArray(embed.data.embeds)).toBe(true)
  })

  it('mentions chain, description, threshold, submitter, and multisig', () => {
    const embed = newRequestEmbed(baseInput)
    const e = embed.data.embeds![0]
    expect(e.title).toContain('Mainnet')
    expect(e.description).toBe('Send 1 ETH to treasury')
    const thresholdField = e.fields!.find((f) => f.name === 'Threshold')
    expect(thresholdField?.value).toContain('1/3 signatures')
    const submitterField = e.fields!.find((f) => f.name === 'Submitter')
    expect(submitterField?.value).toContain('0xd8da…6045')
    expect(e.footer?.text).toContain(baseRequest.multiSigAddress)
  })

  it('uses the ember brand color', () => {
    const embed = newRequestEmbed(baseInput)
    expect(embed.data.embeds![0].color).toBe(0xf97316)
  })

  it('includes a View request link button', () => {
    const embed = newRequestEmbed(baseInput)
    const actions = embed.data.components![0]
    const viewBtn = actions.components.find((c: any) => c.label === 'View request')
    expect(viewBtn).toBeDefined()
    expect(viewBtn.style).toBe(5) // link
    expect(viewBtn.url).toContain(`/request/${baseRequest.id}`)
  })

  it('includes a View on explorer link button when explorerUrl is set', () => {
    const embed = newRequestEmbed(baseInput)
    const actions = embed.data.components![0]
    const explorerBtn = actions.components.find((c: any) => c.label === 'View on explorer')
    expect(explorerBtn).toBeDefined()
    expect(explorerBtn.url).toContain('/address/')
  })

  it('omits the explorer button when explorerUrl is null', () => {
    const embed = newRequestEmbed({ ...baseInput, explorerUrl: null })
    const actions = embed.data.components![0]
    const explorerBtn = actions.components.find((c: any) => c.label === 'View on explorer')
    expect(explorerBtn).toBeUndefined()
  })

  it('falls back to "?" and "unknown chain" when chainName/threshold missing', () => {
    const embed = newRequestEmbed({ ...baseInput, chainName: null, threshold: null })
    expect(embed.data.embeds![0].title).toContain('unknown chain')
    const thresholdField = embed.data.embeds![0].fields!.find((f) => f.name === 'Threshold')
    expect(thresholdField?.value).toContain('1/?')
  })
})