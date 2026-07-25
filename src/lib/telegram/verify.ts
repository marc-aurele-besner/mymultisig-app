import { timingSafeEqual } from 'crypto'

// Verifies the X-Telegram-Bot-Api-Secret-Token header on inbound updates.
//
// Unlike Slack (HMAC-SHA256 over v0:timestamp:rawBody) or Discord
// (Ed25519 over timestamp+rawBody), Telegram's webhook signature
// scheme is just a shared secret string comparison: we generate the
// secret when we call setWebhook, Telegram stores it, and every update
// is delivered with the secret in the X-Telegram-Bot-Api-Secret-Token
// header. See https://core.telegram.org/bots/api#setwebhook and
// https://core.telegram.org/bots/webhooks.
//
// The compare uses timingSafeEqual on equal-length Buffers, with an
// explicit length guard first — Node's timingSafeEqual throws if the
// buffers differ in length, which would itself leak length information
// via the exception path. We instead return false in that case.
//
// Telegram enforces its own server-side replay window via the
// update_id (every update carries a strictly-increasing id we can
// de-dupe), so we do NOT need a timestamp check here.

export interface TelegramVerifyInput {
  provided: string | string[] | undefined
  expected: string
}

export const verifyTelegramSecret = ({ provided, expected }: TelegramVerifyInput): boolean => {
  if (typeof provided !== 'string') return false
  if (provided === '' || expected === '') return false

  const a = Buffer.from(provided, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
