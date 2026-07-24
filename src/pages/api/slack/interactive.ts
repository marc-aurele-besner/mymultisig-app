import { NextApiRequest, NextApiResponse } from 'next'

import { isSlackConfigured, slackConfig } from '../../../lib/slack/config'
import { readRawBody } from '../../../lib/slack/rawBody'
import { verifySlackRequest } from '../../../lib/slack/verify'

// POST /api/slack/interactive — Slack interactivity endpoint (button
// clicks, modal submissions, message actions). For the foundation, every
// payload type is 200-acknowledged. The next PR wires the
// /propose and /sign modals (opened by the slash command responses) to
// real handlers here.
//
// bodyParser:false is required so verifySlackRequest sees the exact raw
// body that Slack signed. The form-encoded body carries a single
// `payload` field whose value is a JSON string with the action details.

export const config = { api: { bodyParser: false } }

const parsePayloadField = (raw: string): unknown | null => {
  for (const pair of raw.split('&')) {
    if (pair === '') continue
    const eq = pair.indexOf('=')
    if (eq < 0) continue
    const key = decodeURIComponent(pair.slice(0, eq))
    if (key !== 'payload') continue
    const value = decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '))
    try {
      return JSON.parse(value) as unknown
    } catch {
      return null
    }
  }
  return null
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isSlackConfigured()) {
    return res.status(503).json({ error: 'Slack app is not configured on this deployment' })
  }

  const rawBody = await readRawBody(req)
  const signature = req.headers['x-slack-signature']
  const timestamp = req.headers['x-slack-request-timestamp']
  const { signingSecret } = slackConfig()
  if (!verifySlackRequest({ signingSecret, signature, timestamp, rawBody })) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const payload = parsePayloadField(rawBody)
  if (payload == null) {
    return res.status(400).json({ error: 'Missing or invalid payload' })
  }

  // The next PR routes by payload.type: 'block_actions' for button clicks,
  // 'view_submission' for modal submits, 'view_closed' for cancels,
  // 'message_action' for shortcut invocations. For now, all 200.
  return res.status(200).end()
}

export default handler
