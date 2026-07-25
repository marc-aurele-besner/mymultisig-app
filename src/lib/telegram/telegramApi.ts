// Thin fetch wrapper for the Telegram Bot API at
// https://api.telegram.org/bot{token}/{method}. Every Bot API method
// accepts POST with a JSON body (and the same `method` as the path
// segment). Responses are always JSON of the shape
//   { ok: boolean, result?: any, description?: string, error_code?: number,
//     parameters?: ResponseParameters }
// — we surface non-ok bodies as a thrown TelegramApiError so each handler
// can decide its own 4xx/5xx contract.
//
// Native fetch (Node 20+) matches the pattern in
// src/pages/api/get-assets.ts, src/lib/slack/slackApi.ts, and
// src/lib/discord/discordApi.ts.
//
// TELEGRAM_API_BASE_URL is overridable for tests; defaults to
// https://api.telegram.org.
//
// See https://core.telegram.org/bots/api.

const TELEGRAM_API_BASE_DEFAULT = 'https://api.telegram.org'

export class TelegramApiError extends Error {
  readonly method: string
  readonly description: string | undefined
  readonly errorCode: number | undefined

  constructor(method: string, description: string | undefined, errorCode: number | undefined) {
    super(`telegram.${method}: ${description ?? 'unknown error'}${errorCode == null ? '' : ` (${errorCode})`}`)
    this.name = 'TelegramApiError'
    this.method = method
    this.description = description
    this.errorCode = errorCode
  }
}

interface TelegramResponse {
  ok: boolean
  result?: any
  description?: string
  error_code?: number
  parameters?: Record<string, unknown>
  [key: string]: any
}

interface TelegramApiOptions {
  // JSON body. Every Bot API method accepts JSON; some also accept
  // application/x-www-form-urlencoded but we standardize on JSON for
  // symmetry with the wire shape.
  json?: Record<string, unknown>
  // Bot token. Required for every call.
  token?: string
}

const baseUrl = (): string => process.env.TELEGRAM_API_BASE_URL ?? TELEGRAM_API_BASE_DEFAULT

export const telegramApi = async (method: string, opts: TelegramApiOptions = {}): Promise<TelegramResponse> => {
  const token = opts.token
  if (token == null || token === '') {
    throw new TelegramApiError(method, 'missing bot token', undefined)
  }
  const headers: Record<string, string> = {}
  let body: string | undefined
  if (opts.json != null) {
    body = JSON.stringify(opts.json)
    headers['Content-Type'] = 'application/json'
  }
  let res: Response
  try {
    res = await fetch(`${baseUrl()}/bot${token}/${method}`, {
      method: 'POST',
      headers,
      body
    })
  } catch (e) {
    throw new TelegramApiError(method, `network error: ${(e as Error).message}`, undefined)
  }
  let json: TelegramResponse
  try {
    json = (await res.json()) as TelegramResponse
  } catch (e) {
    throw new TelegramApiError(method, `non-JSON response (${(e as Error).message})`, undefined)
  }
  if (!res.ok || json.ok === false) {
    throw new TelegramApiError(method, json.description, json.error_code)
  }
  return json
}
