// Channlize Events tests. The SDK's notifier is mocked, so nothing leaves the
// process. The assertions check the event key, data and idempotency key each
// tracked event hands to the SDK, and the result handling in sendChannlizeEvent.

import { jest } from '@jest/globals'

const mockNotify = jest.fn<(...args: unknown[]) => Promise<unknown>>()

jest.mock('@channlize/core', () => {
  const actual = jest.requireActual<typeof import('@channlize/core')>('@channlize/core')
  return {
    ...actual,
    createNotifier:
      () =>
      (...args: unknown[]) =>
        mockNotify(...args)
  }
})

import { isValidEventKey } from '@channlize/core'

import { sendChannlizeEvent } from './client'
import {
  trackMultisigCreated,
  trackMultisigFunded,
  trackTransactionCancelled,
  trackTransactionCreated,
  trackTransactionExecuted,
  trackTransactionReset,
  trackTransactionSigned,
  trackWalletConnected
} from './events'

const ADDRESS = '0x1111111111111111111111111111111111111111'
const OTHER = '0x2222222222222222222222222222222222222222'
const TX_HASH = `0x${'ab'.repeat(32)}`

const originalConsoleError = console.error
const originalConsoleWarn = console.warn

const setConfigured = () => {
  process.env.CHANNLIZE_SERVER_API_KEY = 'ch_live_test_key'
  process.env.CHANNLIZE_PROJECT_ID = 'proj_test'
}

const clearConfig = () => {
  delete process.env.CHANNLIZE_SERVER_API_KEY
  delete process.env.CHANNLIZE_API_KEY
  delete process.env.CHANNLIZE_PROJECT_ID
}

const queuedResponse = { success: true, id: 'del_1', event: 'x', status: 'queued' }

// Mirrors what the notify endpoint accepts for the fields we send: a valid event
// key, primitive data values, and a bounded idempotency key.
const validateNotifyCall = (event: unknown, data: unknown, options: unknown): string[] => {
  const issues: string[] = []
  if (!isValidEventKey(event)) issues.push('event key is invalid')
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    issues.push('data must be an object')
  } else {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (!(value === null || ['string', 'number', 'boolean'].includes(typeof value))) {
        issues.push(`data.${key} must be string, number, boolean or null`)
      }
    }
  }
  const key = (options as { idempotencyKey?: unknown } | undefined)?.idempotencyKey
  if (typeof key !== 'string' || key.length === 0 || key.length > 200) issues.push('idempotencyKey is invalid')
  return issues
}

beforeEach(() => {
  setConfigured()
  mockNotify.mockReset()
  mockNotify.mockResolvedValue(queuedResponse)
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterEach(() => {
  clearConfig()
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

describe('sendChannlizeEvent', () => {
  it('skips without calling the SDK when the server key or project id is missing', async () => {
    clearConfig()
    const result = await sendChannlizeEvent('wallet.connected', { address: ADDRESS }, 'k1')
    expect(result).toEqual({ status: 'skipped', reason: 'not-configured' })
    expect(mockNotify).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('not configured'))
  })

  it('passes the event, data and idempotency key to the SDK', async () => {
    const result = await sendChannlizeEvent('transaction.created', { requestId: 'req-1' }, 'transaction.created:req-1')
    expect(result).toEqual({ status: 'queued', duplicate: false })
    expect(mockNotify).toHaveBeenCalledWith(
      'transaction.created',
      { requestId: 'req-1' },
      {
        idempotencyKey: 'transaction.created:req-1'
      }
    )
  })

  it('reports a duplicate delivery', async () => {
    mockNotify.mockResolvedValueOnce({ ...queuedResponse, duplicate: true })
    const result = await sendChannlizeEvent('wallet.connected', { address: ADDRESS }, 'k3')
    expect(result).toEqual({ status: 'queued', duplicate: true })
  })

  it('returns skipped and logs the reason when the event is not enabled', async () => {
    mockNotify.mockResolvedValueOnce({ ...queuedResponse, status: 'skipped', reason: 'event disabled' })
    const result = await sendChannlizeEvent('multisig.created', { address: ADDRESS }, 'k4')
    expect(result).toEqual({ status: 'skipped', reason: 'event disabled' })
    expect(console.warn).toHaveBeenCalledWith('[channlize] event skipped', {
      event: 'multisig.created',
      reason: 'event disabled'
    })
  })

  it('returns failed when the SDK reports a delivery failure', async () => {
    mockNotify.mockResolvedValueOnce({ ...queuedResponse, status: 'failed', reason: 'bot not in channel' })
    const result = await sendChannlizeEvent('wallet.connected', { address: ADDRESS }, 'k8')
    expect(result).toEqual({ status: 'failed', reason: 'bot not in channel' })
    expect(console.error).toHaveBeenCalled()
  })

  it('rejects an invalid event key without calling the SDK', async () => {
    const result = await sendChannlizeEvent('bad key with spaces', {}, 'k5')
    expect(result).toEqual({ status: 'failed', reason: 'invalid event key' })
    expect(mockNotify).not.toHaveBeenCalled()
  })

  it('never throws when the SDK rejects', async () => {
    mockNotify.mockRejectedValueOnce(new Error('socket hang up'))
    await expect(sendChannlizeEvent('wallet.connected', { address: ADDRESS }, 'k6')).resolves.toEqual({
      status: 'failed',
      reason: 'socket hang up'
    })
    expect(console.error).toHaveBeenCalled()
  })
})

describe('tracked events hand the SDK a valid notify call', () => {
  const lastCall = () => {
    const calls = mockNotify.mock.calls
    return calls[calls.length - 1] as [string, Record<string, unknown>, { idempotencyKey: string }]
  }

  const cases: Array<[string, () => Promise<unknown>, string]> = [
    ['wallet.connected', () => trackWalletConnected({ address: ADDRESS }), 'wallet.connected'],
    [
      'multisig.created',
      () =>
        trackMultisigCreated({
          address: ADDRESS,
          chainId: 11155111,
          chainName: 'Sepolia',
          name: 'Treasury',
          threshold: 2,
          ownerCount: 3
        }),
      'multisig.created'
    ],
    [
      'multisig.funded (native)',
      () =>
        trackMultisigFunded({
          multiSigAddress: ADDRESS,
          chainId: 11155111,
          txHash: TX_HASH,
          asset: 'native',
          amount: '1000',
          funder: OTHER
        }),
      'multisig.funded'
    ],
    [
      'multisig.funded (erc20)',
      () =>
        trackMultisigFunded({
          multiSigAddress: ADDRESS,
          chainId: 11155111,
          txHash: TX_HASH,
          asset: 'erc20',
          tokenAddress: OTHER,
          amount: '5',
          funder: OTHER
        }),
      'multisig.funded'
    ],
    [
      'transaction.created',
      () =>
        trackTransactionCreated({
          requestId: 'req-1',
          multiSigAddress: ADDRESS,
          chainId: 11155111,
          submitter: OTHER,
          description: 'Pay vendor'
        }),
      'transaction.created'
    ],
    [
      'transaction.signed',
      () => trackTransactionSigned({ requestId: 'req-1', multiSigAddress: ADDRESS, signatureCount: 2 }),
      'transaction.signed'
    ],
    [
      'transaction.executed (ok)',
      () => trackTransactionExecuted({ requestId: 'req-1', multiSigAddress: ADDRESS, isSuccessful: true }),
      'transaction.executed'
    ],
    [
      'transaction.execution_failed',
      () => trackTransactionExecuted({ requestId: 'req-1', multiSigAddress: ADDRESS, isSuccessful: false }),
      'transaction.execution_failed'
    ],
    [
      'transaction.cancelled',
      () => trackTransactionCancelled({ requestId: 'req-1', multiSigAddress: ADDRESS, cancelledBy: 'owner' }),
      'transaction.cancelled'
    ],
    [
      'transaction.reset',
      () => trackTransactionReset({ requestId: 'req-1', multiSigAddress: ADDRESS, previousSignatureCount: 2 }),
      'transaction.reset'
    ]
  ]

  it.each(cases)('%s', async (_label, track, eventKey) => {
    await track()
    const [event, data, options] = lastCall()
    expect(event).toBe(eventKey)
    expect(validateNotifyCall(event, data, options)).toEqual([])
  })

  it('keys transaction events by request so a retry carries the same idempotency key', async () => {
    const args = { requestId: 'req-9', multiSigAddress: ADDRESS, chainId: 1, submitter: OTHER, description: 'x' }
    await trackTransactionCreated(args)
    await trackTransactionCreated(args)
    expect(mockNotify.mock.calls.map((call) => (call[2] as { idempotencyKey: string }).idempotencyKey)).toEqual([
      'transaction.created:req-9',
      'transaction.created:req-9'
    ])
  })

  it('keeps long descriptions bounded', async () => {
    await trackTransactionCreated({
      requestId: 'req-2',
      multiSigAddress: ADDRESS,
      chainId: 1,
      submitter: OTHER,
      description: 'a'.repeat(20000)
    })
    const [event, data, options] = lastCall()
    expect(validateNotifyCall(event, data, options)).toEqual([])
    expect((data.description as string).length).toBeLessThanOrEqual(300)
  })
})
