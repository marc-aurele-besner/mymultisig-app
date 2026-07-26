import { explorerUrlForChain } from './chains'
import { findBoundChannels, notifyNewRequest, type NewRequestInput } from './dispatcher'

// Pure-logic smoke tests for the dispatcher surface. Heavy DB testing
// is intentionally skipped — the function is exercised end-to-end via
// the curl-based smoke checks in docs/notifications.md. These tests
// cover the parts that don't need a database:
//
//   1. explorerUrlForChain (pure) returns the right URL for known
//      chains and null for unknown / null inputs.
//   2. findBoundChannels with chainId=null short-circuits to all-empty
//      arrays without hitting the database.
//   3. notifyNewRequest with chainId=null logs and returns without
//      calling findBoundChannels or any platform helper.

const baseInput: NewRequestInput = {
  request: {
    id: '7f3c1b2e-9a4d-4e8b-9c2f-1a2b3c4d5e6f',
    multiSigAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    request: { to: '0xvictim', value: '0', data: '0x', operation: 0 },
    description: 'Test request',
    submitter: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    signatures: [],
    ownerSigners: [],
    dateSubmitted: '2026-07-26T00:00:00Z',
    dateExecuted: '',
    isActive: true,
    isExecuted: false,
    isCancelled: false,
    isConfirmed: false,
    isSuccessful: false
  },
  chainId: 1,
  chainName: 'Mainnet',
  threshold: 2,
  explorerUrl: 'https://etherscan.io'
}

describe('explorerUrlForChain', () => {
  it('returns the etherscan URL for mainnet (chainId 1)', () => {
    expect(explorerUrlForChain(1)).toBe('https://etherscan.io')
  })

  it('returns a polygon URL for chainId 137', () => {
    expect(explorerUrlForChain(137)).toMatch(/polygonscan/)
  })

  it('returns null when chainId is null', () => {
    expect(explorerUrlForChain(null)).toBeNull()
  })

  it('returns null for an unknown chainId', () => {
    expect(explorerUrlForChain(999999)).toBeNull()
  })
})

describe('findBoundChannels (chainId null short-circuit)', () => {
  it('returns all-empty arrays without hitting the database', async () => {
    const channels = await findBoundChannels('0xd8da6bf26964af9d7eed9e03e53415d37aa96045', null)
    expect(channels.slack).toEqual([])
    expect(channels.discord).toEqual([])
    expect(channels.telegram).toEqual([])
  })
})

describe('notifyNewRequest (chainId null short-circuit)', () => {
  it('returns immediately when chainId is null without invoking any send', async () => {
    // Suppress the expected warning so the test output stays clean.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    await expect(
      notifyNewRequest({ ...baseInput, chainId: null, chainName: null, explorerUrl: null })
    ).resolves.toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('chainId missing'))
    warnSpy.mockRestore()
  })
})