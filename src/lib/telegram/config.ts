// Single source of truth for the Telegram bot env vars. The handler at
// src/pages/api/telegram/* goes through `telegramConfig()` (which throws
// when something is missing) or `isTelegramConfigured()` (which returns a
// boolean) so handlers can return a clean 503 instead of a 500 when the
// deployment is unset. Mirrors src/lib/discord/config.ts.
//
// Telegram has no OAuth, no signing secret, and no per-installation public
// key. The only secret is the 32-byte AES key used to encrypt the bot
// token AND the webhook secret token at rest.

export interface TelegramConfig {
  // 32 raw bytes; the env var itself is base64.
  tokenEncryptionKey: Buffer
}

const required = (name: string): string => {
  const value = process.env[name]
  if (value == null || value === '') throw new Error(`Telegram env var missing: ${name}`)
  return value
}

const requiredBytes = (name: string, length: number): Buffer => {
  const raw = required(name)
  const buf = Buffer.from(raw, 'base64')
  if (buf.length !== length) {
    throw new Error(`Telegram env var ${name} must decode to ${length} bytes (got ${buf.length})`)
  }
  return buf
}

let cached: TelegramConfig | null = null

export const telegramConfig = (): TelegramConfig => {
  if (cached != null) return cached
  cached = {
    tokenEncryptionKey: requiredBytes('TELEGRAM_TOKEN_ENCRYPTION_KEY', 32)
  }
  return cached
}

export const isTelegramConfigured = (): boolean => {
  try {
    telegramConfig()
    return true
  } catch {
    return false
  }
}

// Build the full webhook URL from the request's host. Telegram only
// accepts https URLs from public IPs; the localhost heuristic lets the
// handler talk to a dev server via ngrok or similar.
export const webhookUrl = (host: string | undefined, proto: string | undefined): string => {
  const base = host == null || host === '' ? 'localhost:3000' : host
  const isLocal = base.startsWith('localhost') || base.startsWith('127.')
  const scheme = isLocal ? 'http' : proto === 'http' ? 'http' : 'https'
  return `${scheme}://${base}/api/telegram/webhook`
}
