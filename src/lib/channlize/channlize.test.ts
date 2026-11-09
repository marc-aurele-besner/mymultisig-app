// Channlize connection tests. fetch is mocked, so nothing leaves the process.
// validateChannlizePayload mirrors the constraints of the published JSON Schema
// (https://api.channlize.com/api/in/schema.json) for the fields we send, so
// every builder's payload is checked against the required fields and limits.

import { jest } from '@jest/globals'

import { sendChannlizeEvent, ChannlizeEvent } from './client'
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

const originalFetch = global.fetch
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

const EVENT_KEY = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/
const CHANNEL_ID = /^[CG][A-Z0-9]{6,}$/
const TYPES = ['alert', 'conversation', 'log']
const PRIORITIES = ['low', 'normal', 'high', 'urgent']

const validateChannlizePayload = (payload: Record<string, unknown>): string[] => {
  const issues: string[] = []
  const str = (key: string, min: number, max: number) => {
    const value = payload[key]
    if (typeof value !== 'string') return issues.push(`${key} must be a string`)
    if (value.length < min || value.length > max) issues.push(`${key} length must be ${min}..${max}`)
  }

  // Required top-level fields.
  for (const key of ['type', 'event', 'message']) {
    if (payload[key] === undefined) issues.push(`${key} is required`)
  }
  if (payload.type !== undefined && !TYPES.includes(payload.type as string)) issues.push('type not in enum')
  if (payload.event !== undefined) {
    str('event', 1, 150)
    if (typeof payload.event === 'string' && !EVENT_KEY.test(payload.event)) issues.push('event pattern mismatch')
  }
  if (payload.message !== undefined) str('message', 1, 10000)
  if (payload.title !== undefined) str('title', 0, 300)
  if (payload.url !== undefined) {
    str('url', 0, 2000)
    if (typeof payload.url === 'string' && !/^https?:\/\//.test(payload.url)) issues.push('url must be http(s)')
  }
  if (payload.priority !== undefined && !PRIORITIES.includes(payload.priority as string)) {
    issues.push('priority not in enum')
  }
  if (payload.channel !== undefined) {
    str('channel', 0, 50)
    if (typeof payload.channel === 'string' && !CHANNEL_ID.test(payload.channel))
      issues.push('channel pattern mismatch')
  }
  if (payload.idempotencyKey !== undefined) str('idempotencyKey', 0, 200)

  if (payload.fields !== undefined) {
    const fields = payload.fields as Record<string, unknown>
    if (Object.keys(fields).length > 50) issues.push('fields maxProperties 50')
    for (const [key, value] of Object.entries(fields)) {
      if (!(value === null || ['string', 'number', 'boolean'].includes(typeof value))) {
        issues.push(`fields.${key} must be string, number, boolean or null`)
      }
    }
  }
  if (payload.customer !== undefined) {
    const customer = payload.customer as Record<string, unknown>
    if (typeof customer.email !== 'string') issues.push('customer.email is required')
  }
  if (payload.tags !== undefined && Array.isArray(payload.tags)) {
    if (payload.tags.length > 20) issues.push('tags maxItems 20')
  }
  return issues
}

describe('sendChannlizeEvent', () => {
  const baseEvent: ChannlizeEvent = {
    type: 'log',
    event: 'test.event',
    message: 'hello',
    idempotencyKey: 'test.event:1'
  }
  let fetchMock: jest.Mock<typeof fetch>
  let consoleError: jest.Mock
  let consoleWarn: jest.Mock

  beforeEach(() => {
    process.env.CHANNLIZE_CONNECTION_URL = 'https://hooks.example.test/in/abc'
    process.env.CHANNLIZE_CONNECTION_SECRET = 'secret-123'
    fetchMock = jest.fn<typeof fetch>()
    global.fetch = fetchMock as unknown as typeof fetch
    consoleError = jest.fn()
    consoleWarn = jest.fn()
    console.error = consoleError
    console.warn = consoleWarn
  })

  afterEach(() => {
    delete process.env.CHANNLIZE_CONNECTION_URL
    delete process.env.CHANNLIZE_CONNECTION_SECRET
    global.fetch = originalFetch
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  })

  const respond = (status: number, body: unknown) =>
    fetchMock.mockResolvedValueOnce(
      new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
      })
    )

  it('skips without calling fetch when the connection is not configured', async () => {
    delete process.env.CHANNLIZE_CONNECTION_URL
    const result = await sendChannlizeEvent(baseEvent)
    expect(result).toEqual({ status: 'skipped', reason: 'not-configured' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('POSTs the payload with bearer auth and the idempotency key header', async () => {
    respond(200, { status: 'accepted' })
    const result = await sendChannlizeEvent(baseEvent)

    expect(result.status).toBe('sent')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://hooks.example.test/in/abc')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret-123')
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('test.event:1')
    expect(JSON.parse(init.body as string)).toEqual(baseEvent)
    expect(validateChannlizePayload(JSON.parse(init.body as string))).toEqual([])
  })

  it('treats status "ignored" as a dashboard switch to flip', async () => {
    respond(200, { status: 'ignored' })
    const result = await sendChannlizeEvent(baseEvent)
    expect(result.status).toBe('ignored')
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('switch it on in the Channlize dashboard'))
  })

  it('logs the issues and returns invalid on 400 INVALID_PAYLOAD', async () => {
    const issues = [{ path: 'event', message: 'pattern mismatch' }]
    respond(400, { code: 'INVALID_PAYLOAD', issues })
    const result = await sendChannlizeEvent(baseEvent)
    expect(result).toEqual({ status: 'invalid', issues })
    expect(consoleError).toHaveBeenCalledWith('[channlize] INVALID_PAYLOAD', expect.objectContaining({ issues }))
  })

  it('reports a non-2xx response as failed without throwing', async () => {
    respond(500, { message: 'boom' })
    await expect(sendChannlizeEvent(baseEvent)).resolves.toEqual({ status: 'failed', reason: 'HTTP 500' })
  })

  it('never throws on a network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('socket hang up'))
    await expect(sendChannlizeEvent(baseEvent)).resolves.toEqual({ status: 'failed', reason: 'socket hang up' })
  })
})

describe('event payloads match the Channlize schema', () => {
  let fetchMock: jest.Mock<typeof fetch>

  beforeEach(() => {
    process.env.CHANNLIZE_CONNECTION_URL = 'https://hooks.example.test/in/abc'
    process.env.CHANNLIZE_CONNECTION_SECRET = 'secret-123'
    fetchMock = jest
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response('{"status":"accepted"}', { status: 200 }))
    global.fetch = fetchMock as unknown as typeof fetch
    console.error = jest.fn()
  })

  afterEach(() => {
    delete process.env.CHANNLIZE_CONNECTION_URL
    delete process.env.CHANNLIZE_CONNECTION_SECRET
    global.fetch = originalFetch
    console.error = originalConsoleError
  })

  const sentPayload = (): Record<string, unknown> => {
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit]
    return JSON.parse(init.body as string)
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
      'transaction.executed (failed)',
      () => trackTransactionExecuted({ requestId: 'req-1', multiSigAddress: ADDRESS, isSuccessful: false }),
      'transaction.executed'
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
    const payload = sentPayload()
    expect(payload.event).toBe(eventKey)
    expect(validateChannlizePayload(payload)).toEqual([])
    expect(typeof payload.idempotencyKey).toBe('string')
    expect((payload.idempotencyKey as string).length).toBeGreaterThan(0)
  })

  it('keys transaction events by request so a retry is deduplicated', async () => {
    await trackTransactionCreated({
      requestId: 'req-9',
      multiSigAddress: ADDRESS,
      chainId: 1,
      submitter: OTHER,
      description: 'x'
    })
    await trackTransactionCreated({
      requestId: 'req-9',
      multiSigAddress: ADDRESS,
      chainId: 1,
      submitter: OTHER,
      description: 'x'
    })
    const keys = fetchMock.mock.calls.map(
      (call: unknown[]) => JSON.parse((call[1] as RequestInit).body as string).idempotencyKey
    )
    expect(keys).toEqual(['transaction.created:req-9', 'transaction.created:req-9'])
  })

  it('keeps long descriptions under the 10000 character message limit', async () => {
    await trackTransactionCreated({
      requestId: 'req-2',
      multiSigAddress: ADDRESS,
      chainId: 1,
      submitter: OTHER,
      description: 'a'.repeat(20000)
    })
    expect(validateChannlizePayload(sentPayload())).toEqual([])
  })
})
