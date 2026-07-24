// Single source of truth for Slack app env vars. Every endpoint that talks
// to Slack should go through `slackConfig()` (which throws when something is
// missing) or `isSlackConfigured()` (which returns a boolean) so handlers
// can return a clean 503 instead of a 500 when the deployment is unset.

export interface SlackConfig {
  clientId: string
  clientSecret: string
  signingSecret: string
  // 32 raw bytes; the env var itself is base64.
  tokenEncryptionKey: Buffer
}

const required = (name: string): string => {
  const value = process.env[name]
  if (value == null || value === '') throw new Error(`Slack env var missing: ${name}`)
  return value
}

const requiredBytes = (name: string, length: number): Buffer => {
  const raw = required(name)
  const buf = Buffer.from(raw, 'base64')
  if (buf.length !== length) {
    throw new Error(`Slack env var ${name} must decode to ${length} bytes (got ${buf.length})`)
  }
  return buf
}

let cached: SlackConfig | null = null

export const slackConfig = (): SlackConfig => {
  if (cached != null) return cached
  cached = {
    clientId: required('SLACK_CLIENT_ID'),
    clientSecret: required('SLACK_CLIENT_SECRET'),
    signingSecret: required('SLACK_SIGNING_SECRET'),
    tokenEncryptionKey: requiredBytes('SLACK_TOKEN_ENCRYPTION_KEY', 32)
  }
  return cached
}

export const isSlackConfigured = (): boolean => {
  try {
    slackConfig()
    return true
  } catch {
    return false
  }
}

// Build the full OAuth redirect URL from the request's host. The install
// handler owns this so it can read the live host header. SLACK_REDIRECT_URI
// overrides for deployments behind a proxy or with a custom domain.
export const buildRedirectUri = (host: string | undefined, proto: string | undefined): string => {
  if (process.env.SLACK_REDIRECT_URI != null && process.env.SLACK_REDIRECT_URI !== '') {
    return process.env.SLACK_REDIRECT_URI
  }
  const base = host == null || host === '' ? 'localhost:3000' : host
  const isLocal = base.startsWith('localhost') || base.startsWith('127.')
  const scheme = isLocal ? 'http' : proto === 'http' ? 'http' : 'https'
  return `${scheme}://${base}/api/slack/oauth-callback`
}
