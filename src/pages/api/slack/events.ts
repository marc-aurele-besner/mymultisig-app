import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { isSlackConfigured, slackConfig } from '../../../lib/slack/config'
import { readRawBody } from '../../../lib/slack/rawBody'
import { verifySlackRequest } from '../../../lib/slack/verify'
import { getDb } from '../../../lib/db/neon'
import { slackChannelConfigs, slackUserLinks, slackWorkspaces } from '../../../lib/db/schema'

// POST /api/slack/events — Slack Event Subscriptions endpoint. Handles the
// URL verification handshake on first install and the few events we care
// about (app_uninstalled for cleanup). All other events are 200-acknowledged
// as a no-op; the next PR will route new-request and threshold-reached
// events to chat.postMessage.
//
// bodyParser:false is required so verifySlackRequest gets the exact raw body
// that Slack signed. With bodyParser off, req.body is null — do not pass
// this request through parseBody from src/lib/api/middleware.ts.

export const config = { api: { bodyParser: false } }

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

  let parsed: { type?: string; challenge?: string; event?: { type?: string; team_id?: string } }
  try {
    parsed = JSON.parse(rawBody) as typeof parsed
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (parsed.type === 'url_verification' && typeof parsed.challenge === 'string') {
    return res.status(200).json({ challenge: parsed.challenge })
  }

  if (parsed.type === 'event_callback' && parsed.event?.type === 'app_uninstalled') {
    const teamId = parsed.event.team_id
    if (typeof teamId !== 'string' || teamId === '') {
      return res.status(200).end()
    }
    // Return 200 immediately, then fire the deletes asynchronously. Slack
    // retries non-2xx up to 3 times; the deletes are idempotent so it's
    // safe to fire them after we've already responded. This protects the
    // 3-second response deadline.
    res.status(200).end()
    const db = getDb()
    void Promise.all([
      db.delete(slackWorkspaces).where(eq(slackWorkspaces.teamId, teamId)),
      db.delete(slackUserLinks).where(eq(slackUserLinks.teamId, teamId)),
      db.delete(slackChannelConfigs).where(eq(slackChannelConfigs.teamId, teamId))
    ]).catch((e) => console.error('app_uninstalled cleanup failed', e))
    return
  }

  // Any other event_callback: 200, no-op. The next PR wires these to
  // chat.postMessage for new-request and threshold-reached events.
  return res.status(200).end()
}

export default handler
