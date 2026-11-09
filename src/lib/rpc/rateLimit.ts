// Helpers for RPC calls that can hit a provider's rate limit. Public and free-tier
// endpoints answer HTTP 429 (or a JSON-RPC body carrying code 429) once a burst
// exceeds their quota, and that quota recovers within seconds.

export const RATE_LIMIT_MESSAGE = 'the RPC provider is rate limiting activity lookups. Wait a moment, then try again.'

const RATE_LIMIT_PATTERN = /rate limit|exceeds defined limit|too many requests|\b429\b/i
const MAX_CAUSE_DEPTH = 5

// viem and wagmi wrap transport failures, so the status can sit on a nested cause.
export const isRateLimitError = (error: unknown, depth = 0): boolean => {
  if (error == null || typeof error !== 'object' || depth > MAX_CAUSE_DEPTH) return false
  const { status, code, message, details, cause } = error as Record<string, unknown>
  if (status === 429 || code === 429) return true
  if (typeof message === 'string' && RATE_LIMIT_PATTERN.test(message)) return true
  if (typeof details === 'string' && RATE_LIMIT_PATTERN.test(details)) return true
  return isRateLimitError(cause, depth + 1)
}

export const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

type RetryOptions = {
  retries?: number
  baseDelayMs?: number
}

// Retries a call that failed on a rate limit, backing off exponentially (1s, 2s,
// 4s by default). Any other error is rethrown on the first attempt.
export const withRateLimitRetry = async <T>(
  fn: () => Promise<T>,
  { retries = 3, baseDelayMs = 1_000 }: RetryOptions = {}
): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt >= retries || !isRateLimitError(error)) throw error
      await pause(baseDelayMs * 2 ** attempt)
    }
  }
}
