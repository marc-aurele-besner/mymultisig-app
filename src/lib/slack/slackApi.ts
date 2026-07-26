// Thin fetch wrapper for https://slack.com/api/{method}. The Slack Web API
// returns a JSON body for every method, with an `ok: boolean` field that
// callers must check themselves (we surface non-ok responses as a thrown
// SlackApiError so each handler can decide its own 502/503 contract).
//
// Native fetch is used (Node 20+) to match the pattern in
// src/pages/api/get-assets.ts. The body shape per call is either
// application/x-www-form-urlencoded (for oauth.v2.access and
// apps.uninstall, per Slack's docs) or empty with an Authorization header
// (for auth.test).

const SLACK_API_BASE = 'https://slack.com/api'

export class SlackApiError extends Error {
  readonly method: string
  readonly errorCode: string | undefined

  constructor(method: string, message: string, errorCode?: string) {
    super(`${method}: ${message}${errorCode == null ? '' : ` (${errorCode})`}`)
    this.name = 'SlackApiError'
    this.method = method
    this.errorCode = errorCode
  }
}

interface SlackResponse {
  ok: boolean
  error?: string
   
  [key: string]: any
}

const formEncode = (params: Record<string, string>): string =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

interface SlackApiOptions {
  // application/x-www-form-urlencoded body (no token; token comes from caller
  // separately when needed).
  form?: Record<string, string>
  // JSON body. Used by chat.postMessage and any future JSON-only method.
  // Wins when both `form` and `json` are set, matching discordApi's
  // behavior.
  json?: Record<string, unknown>
  // Bearer token. Used by auth.test and any future per-team read.
  token?: string
}

export const slackApi = async (method: string, opts: SlackApiOptions = {}): Promise<SlackResponse> => {
  const headers: Record<string, string> = {}
  let body: string | undefined
  if (opts.token != null) {
    headers['Authorization'] = `Bearer ${opts.token}`
  }
  if (opts.json != null) {
    body = JSON.stringify(opts.json)
    headers['Content-Type'] = 'application/json; charset=utf-8'
  } else if (opts.form != null) {
    body = formEncode(opts.form)
    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8'
  }
  const res = await fetch(`${SLACK_API_BASE}/${method}`, {
    method: 'POST',
    headers,
    body
  })
  // Slack returns 200 even on application errors; parse the body for `ok`.
  let json: SlackResponse
  try {
    json = (await res.json()) as SlackResponse
  } catch (e) {
    throw new SlackApiError(method, `non-JSON response (${(e as Error).message})`)
  }
  if (!json.ok) {
    throw new SlackApiError(method, json.error ?? 'unknown error', json.error)
  }
  return json
}
