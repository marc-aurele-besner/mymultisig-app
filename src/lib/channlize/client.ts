import { createNotifier, isValidEventKey } from '@channlize/core'

// Channlize Events, sent from the server through the @channlize/core SDK
// (POST /v1/notify). Server-only: the server key must never reach the browser.
//
// Reads CHANNLIZE_SERVER_API_KEY (or CHANNLIZE_API_KEY) and CHANNLIZE_PROJECT_ID.
// The event key picks the Slack channel and message template configured under
// Events in the Channlize dashboard, and `data` fills its {{field}} placeholders.
//
// Delivery is best-effort. sendChannlizeEvent never throws, so a Channlize outage
// or a missing configuration cannot fail the API request that triggered it.

export type ChannlizeFieldValue = string | number | boolean | null
export type ChannlizeData = Record<string, ChannlizeFieldValue>

export type ChannlizeSendResult =
  | { status: 'queued'; duplicate: boolean }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string }

const SEND_TIMEOUT_MS = 3000

const notify = createNotifier({ timeout: SEND_TIMEOUT_MS })

const isConfigured = (): boolean =>
  Boolean((process.env.CHANNLIZE_SERVER_API_KEY ?? process.env.CHANNLIZE_API_KEY)?.trim()) &&
  Boolean(process.env.CHANNLIZE_PROJECT_ID?.trim())

let warnedNotConfigured = false

export const sendChannlizeEvent = async (
  event: string,
  data: ChannlizeData,
  idempotencyKey: string
): Promise<ChannlizeSendResult> => {
  if (!isValidEventKey(event)) {
    console.error('[channlize] invalid event key', { event })
    return { status: 'failed', reason: 'invalid event key' }
  }
  if (!isConfigured()) {
    if (!warnedNotConfigured) {
      warnedNotConfigured = true
      console.warn(
        '[channlize] not configured: set CHANNLIZE_SERVER_API_KEY and CHANNLIZE_PROJECT_ID. Events are skipped.'
      )
    }
    return { status: 'skipped', reason: 'not-configured' }
  }

  try {
    const res = await notify(event, data, { idempotencyKey })
    if (res.status === 'skipped') {
      // Usually an event key that is not enabled yet in the dashboard, or no Slack channel bound.
      console.warn('[channlize] event skipped', { event, reason: res.reason })
      return { status: 'skipped', reason: res.reason ?? 'unknown' }
    }
    if (res.status === 'failed') {
      console.error('[channlize] delivery failed', { event, reason: res.reason })
      return { status: 'failed', reason: res.reason ?? 'unknown' }
    }
    return { status: 'queued', duplicate: res.duplicate === true }
  } catch (error) {
    const reason = (error as Error).message
    console.error('[channlize] send failed', { event, reason })
    return { status: 'failed', reason }
  }
}
