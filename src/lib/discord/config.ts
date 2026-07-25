// Single source of truth for Discord app env vars. Every endpoint that
// talks to Discord should go through `discordConfig()` (which throws when
// something is missing) or `isDiscordConfigured()` (which returns a
// boolean) so handlers can return a clean 503 instead of a 500 when the
// deployment is unset. Mirrors src/lib/slack/config.ts.

export interface DiscordConfig {
  clientId: string
  clientSecret: string
  // Hex-encoded Ed25519 public key from the Discord application's General
  // Information page. Used to verify every inbound interaction (PING,
  // slash commands, component clicks). Unlike Slack, Discord's signature
  // scheme has no replay window — the timestamp is part of the signed
  // message but there's no separate skew check. We still validate that
  // the timestamp is a finite number to fail fast on garbage headers.
  publicKey: string
  // 32 raw bytes; the env var itself is base64.
  tokenEncryptionKey: Buffer
}

const required = (name: string): string => {
  const value = process.env[name]
  if (value == null || value === '') throw new Error(`Discord env var missing: ${name}`)
  return value
}

const requiredBytes = (name: string, length: number): Buffer => {
  const raw = required(name)
  const buf = Buffer.from(raw, 'base64')
  if (buf.length !== length) {
    throw new Error(`Discord env var ${name} must decode to ${length} bytes (got ${buf.length})`)
  }
  return buf
}

let cached: DiscordConfig | null = null

export const discordConfig = (): DiscordConfig => {
  if (cached != null) return cached
  cached = {
    clientId: required('DISCORD_CLIENT_ID'),
    clientSecret: required('DISCORD_CLIENT_SECRET'),
    publicKey: required('DISCORD_PUBLIC_KEY'),
    tokenEncryptionKey: requiredBytes('DISCORD_TOKEN_ENCRYPTION_KEY', 32)
  }
  return cached
}

export const isDiscordConfigured = (): boolean => {
  try {
    discordConfig()
    return true
  } catch {
    return false
  }
}

// Build the full OAuth redirect URL from the request's host. The install
// handler owns this so it can read the live host header. DISCORD_REDIRECT_URI
// overrides for deployments behind a proxy or with a custom domain.
export const buildRedirectUri = (host: string | undefined, proto: string | undefined): string => {
  if (process.env.DISCORD_REDIRECT_URI != null && process.env.DISCORD_REDIRECT_URI !== '') {
    return process.env.DISCORD_REDIRECT_URI
  }
  const base = host == null || host === '' ? 'localhost:3000' : host
  const isLocal = base.startsWith('localhost') || base.startsWith('127.')
  const scheme = isLocal ? 'http' : proto === 'http' ? 'http' : 'https'
  return `${scheme}://${base}/api/discord/oauth-callback`
}
