// Channlize "Zapier, Make & n8n" connection client. Server-only: the connection
// URL and secret come from env at call time and must never reach the browser.
//
// Delivery is best-effort. sendChannlizeEvent never throws and never rejects,
// so a Channlize outage or a misconfigured connection cannot fail the API
// request that triggered the event. Calls are bounded by a short timeout so a
// slow Channlize cannot hold a response open for long.

export type ChannlizeEventType = 'alert' | 'conversation' | 'log'
export type ChannlizePriority = 'low' | 'normal' | 'high' | 'urgent'
export type ChannlizeFieldValue = string | number | boolean | null

export interface ChannlizeCustomer {
  email: string
  name?: string
  phone?: string
}

export interface ChannlizeEvent {
  type: ChannlizeEventType
  // Event key, e.g. "transaction.created". Each key is switched on separately
  // in the Channlize dashboard.
  event: string
  message: string
  title?: string
  fields?: Record<string, ChannlizeFieldValue>
  url?: string
  customer?: ChannlizeCustomer
  priority?: ChannlizePriority
  tags?: string[]
  channel?: string
  // Stable per logical event (for example, derived from the request id and the
  // state transition), so a retried send is acknowledged and dropped.
  idempotencyKey: string
}

export type ChannlizeSendResult =
  | { status: 'sent'; body: unknown }
  // Channlize accepted the payload but the event key is off. Switch it on in
  // the dashboard.
  | { status: 'ignored'; body: unknown }
  // 400 INVALID_PAYLOAD. The issues are logged and returned.
  | { status: 'invalid'; issues: unknown }
  | { status: 'failed'; reason: string }
  | { status: 'skipped'; reason: 'not-configured' }

const SEND_TIMEOUT_MS = 3000

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const isIgnored = (body: unknown): boolean =>
  typeof body === 'object' && body !== null && (body as { status?: unknown }).status === 'ignored'

export const sendChannlizeEvent = async (event: ChannlizeEvent): Promise<ChannlizeSendResult> => {
  const url = process.env.CHANNLIZE_CONNECTION_URL?.trim()
  const secret = process.env.CHANNLIZE_CONNECTION_SECRET?.trim()
  if (!url || !secret) {
    return { status: 'skipped', reason: 'not-configured' }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
        'Idempotency-Key': event.idempotencyKey
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS)
    })
    const body = await readJson(response)

    if (response.status === 400) {
      const issues = (body as { issues?: unknown } | null)?.issues ?? body
      console.error('[channlize] INVALID_PAYLOAD', { event: event.event, issues })
      return { status: 'invalid', issues }
    }
    if (!response.ok) {
      console.error('[channlize] send failed', { event: event.event, status: response.status })
      return { status: 'failed', reason: `HTTP ${response.status}` }
    }
    if (isIgnored(body)) {
      console.warn(`[channlize] event "${event.event}" is ignored: switch it on in the Channlize dashboard`)
      return { status: 'ignored', body }
    }
    return { status: 'sent', body }
  } catch (error) {
    const reason = (error as Error).message
    console.error('[channlize] send failed', { event: event.event, reason })
    return { status: 'failed', reason }
  }
}
