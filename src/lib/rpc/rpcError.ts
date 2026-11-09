import { isRateLimitError } from './rateLimit'

// Tells transport failures (the RPC endpoint is down, slow, rate limiting or
// refusing the request) apart from contract reverts and wallet rejections, so
// the UI can point the user at their custom RPC settings only when a better
// endpoint would actually help.

const TRANSPORT_ERROR_NAMES = new Set([
  'HttpRequestError',
  'TimeoutError',
  'WebSocketRequestError',
  'LimitExceededRpcError',
  'ResourceUnavailableRpcError',
  'MethodNotSupportedRpcError'
])

const TRANSPORT_ERROR_PATTERN =
  /failed to fetch|fetch failed|networkerror|network request failed|request timed out|took too long|ECONNREFUSED|ENOTFOUND|bad gateway|service unavailable|gateway timeout|\b50[234]\b/i

const MAX_CAUSE_DEPTH = 5

export const isRpcError = (error: unknown, depth = 0): boolean => {
  if (error == null || typeof error !== 'object' || depth > MAX_CAUSE_DEPTH) return false
  if (isRateLimitError(error)) return true
  const { name, message, details, cause } = error as Record<string, unknown>
  if (typeof name === 'string' && TRANSPORT_ERROR_NAMES.has(name)) return true
  if (typeof details === 'string' && TRANSPORT_ERROR_PATTERN.test(details)) return true
  if (typeof message === 'string' && TRANSPORT_ERROR_PATTERN.test(message)) return true
  return isRpcError(cause, depth + 1)
}

// Where to configure a custom RPC: the open multisig's own settings section
// when there is one, otherwise the per-wallet settings page.
export const RPC_SETTINGS_PATH = '/settings/rpc'
export const rpcSettingsHref = (multisig?: string | null): string =>
  multisig != null ? `/multisig/${multisig}/settings#rpc` : RPC_SETTINGS_PATH
