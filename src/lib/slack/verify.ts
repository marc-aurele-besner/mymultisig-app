import { createHmac, timingSafeEqual } from 'crypto'

// Verifies the X-Slack-Signature / X-Slack-Request-Timestamp pair on inbound
// requests from Slack. See https://api.slack.com/authentication/verifying-requests-from-slack.
//
// - Reject when the timestamp is more than 5 minutes off (replay window).
// - Compute v0=HMAC-SHA256(signingSecret, "v0:" + timestamp + ":" + rawBody).
// - Constant-time compare against the header.
// - The header MUST start with "v0=" and match the computed length before
//   timingSafeEqual to avoid the (theoretical) length side-channel on
//   malformed headers.

const MAX_CLOCK_SKEW_SECONDS = 300
const SIGNATURE_VERSION = 'v0='

export interface SlackVerifyInput {
  signingSecret: string
  signature: string | string[] | undefined
  timestamp: string | string[] | undefined
  rawBody: string
}

export const verifySlackRequest = ({ signingSecret, signature, timestamp, rawBody }: SlackVerifyInput): boolean => {
  if (typeof signature !== 'string' || typeof timestamp !== 'string') return false
  if (!signature.startsWith(SIGNATURE_VERSION)) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  const skew = Math.abs(Math.floor(Date.now() / 1000) - ts)
  if (skew > MAX_CLOCK_SKEW_SECONDS) return false

  const base = `v0:${timestamp}:${rawBody}`
  const computed = SIGNATURE_VERSION + createHmac('sha256', signingSecret).update(base).digest('hex')

  if (signature.length !== computed.length) return false
  const a = Buffer.from(signature)
  const b = Buffer.from(computed)
  return timingSafeEqual(a, b)
}
