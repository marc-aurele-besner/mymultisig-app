import { isRateLimitError, withRateLimitRetry } from './rateLimit'

describe('isRateLimitError', () => {
  it('detects an HTTP 429 status', () => {
    expect(isRateLimitError({ status: 429 })).toBe(true)
  })

  it('detects a JSON-RPC body carrying code 429', () => {
    expect(isRateLimitError({ code: 429, message: 'slow down' })).toBe(true)
  })

  it('detects the provider message text', () => {
    expect(isRateLimitError(new Error('Request exceeds defined limit. Status: 429'))).toBe(true)
    expect(isRateLimitError(new Error('Rate limit exceeded'))).toBe(true)
  })

  it('finds a rate limit on a nested cause', () => {
    const wrapped = new Error('getContractEvents failed', { cause: { status: 429 } })
    expect(isRateLimitError(wrapped)).toBe(true)
  })

  it('ignores unrelated failures, including the -32005 range limit', () => {
    expect(isRateLimitError(new Error('execution reverted'))).toBe(false)
    expect(isRateLimitError({ code: -32005, message: 'query returned more than 10000 results' })).toBe(false)
    expect(isRateLimitError(null)).toBe(false)
    expect(isRateLimitError('429')).toBe(false)
  })
})

describe('withRateLimitRetry', () => {
  it('retries rate-limited calls until one succeeds', async () => {
    const fn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ status: 429 })
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValue('ok')

    await expect(withRateLimitRetry(fn, { baseDelayMs: 0 })).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('rethrows other errors without retrying', async () => {
    const fn = jest.fn<() => Promise<string>>().mockRejectedValue(new Error('boom'))

    await expect(withRateLimitRetry(fn, { baseDelayMs: 0 })).rejects.toThrow('boom')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('gives up after the configured retries', async () => {
    const fn = jest.fn<() => Promise<string>>().mockRejectedValue({ status: 429 })

    await expect(withRateLimitRetry(fn, { retries: 2, baseDelayMs: 0 })).rejects.toEqual({ status: 429 })
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
