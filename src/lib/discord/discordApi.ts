// Thin fetch wrapper for https://discord.com/api/v10/{path}. The Discord
// REST API returns a JSON body for every endpoint. Non-2xx responses and
// JSON bodies with a top-level `code` field are surfaced as a thrown
// DiscordApiError so each handler can decide its own 502/503 contract.
//
// Native fetch is used (Node 20+) to match the pattern in
// src/pages/api/get-assets.ts and src/lib/slack/slackApi.ts. The body
// shape per call is either application/x-www-form-urlencoded (for the
// OAuth2 token exchange per Discord's docs) or empty with an
// Authorization + Bot token header (for any future per-guild read).
//
// See https://discord.com/developers/docs/reference.

const DISCORD_API_BASE = 'https://discord.com/api/v10'

export class DiscordApiError extends Error {
  readonly path: string
  readonly code: number | string | undefined

  constructor(path: string, message: string, code?: number | string) {
    super(`${path}: ${message}${code == null ? '' : ` (${code})`}`)
    this.name = 'DiscordApiError'
    this.path = path
    this.code = code
  }
}

interface DiscordResponse {
  // OAuth2 token response doesn't have a `code` field; everything else
  // from the API does. Keep it loose to accept both shapes.

  [key: string]: any
}

const formEncode = (params: Record<string, string>): string =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  .join('&')

interface DiscordApiOptions {
  // application/x-www-form-urlencoded body (no token; token comes from
  // caller separately when needed).
  form?: Record<string, string>
  // JSON body. Wins when both `form` and `json` are set.
  json?: Record<string, unknown>
  // Bot token. Used for any per-guild read/write.
  token?: string
}

export const discordApi = async (path: string, opts: DiscordApiOptions = {}): Promise<DiscordResponse> => {
  const headers: Record<string, string> = {}
  let body: string | undefined
  if (opts.token != null) {
    headers['Authorization'] = `Bot ${opts.token}`
  }
  if (opts.json != null) {
    body = JSON.stringify(opts.json)
    headers['Content-Type'] = 'application/json'
  } else if (opts.form != null) {
    body = formEncode(opts.form)
    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8'
  }
  const res = await fetch(`${DISCORD_API_BASE}/${path}`, {
    method: 'POST',
    headers,
    body
  })
  let json: DiscordResponse
  try {
    json = (await res.json()) as DiscordResponse
  } catch (e) {
    throw new DiscordApiError(path, `non-JSON response (${(e as Error).message})`)
  }
  // The OAuth2 token endpoint returns 200 + body on success, 4xx on
  // error. The error body is { error, error_description }. Surface
  // both as DiscordApiError so the OAuth callback can redirect to
  // /settings/discord?installed=0&error=<code>.
  if (!res.ok) {
    const err = typeof json.error === 'string' ? json.error : `http_${res.status}`
    const desc = typeof json.error_description === 'string' ? json.error_description : `HTTP ${res.status}`
    throw new DiscordApiError(path, desc, err)
  }
  // Some endpoints return 200 with a top-level `code: number` to signal
  // a Discord-side error (rate limit, missing permission, etc.).
  if (typeof json.code === 'number' && json.code >= 10000) {
    const msg = typeof json.message === 'string' ? json.message : 'unknown error'
    throw new DiscordApiError(path, msg, json.code)
  }
  return json
}
