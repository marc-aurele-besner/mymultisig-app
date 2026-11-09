import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { helpMessage } from '../../../lib/slack/blockKit'
import { isSlackConfigured, slackConfig } from '../../../lib/slack/config'
import { decryptToken } from '../../../lib/slack/crypto'
import { readRawBody } from '../../../lib/slack/rawBody'
import { slackApi } from '../../../lib/slack/slackApi'
import { verifySlackRequest } from '../../../lib/slack/verify'
import { getDb } from '../../../lib/db/neon'
import { slackChannelConfigs, slackUserLinks, slackWorkspaces } from '../../../lib/db/schema'

// POST /api/slack/events — Slack Event Subscriptions endpoint. Handles the
// URL verification handshake and three events:
//   app_uninstalled / tokens_revoked — drop the workspace's rows
//   app_mention                      — reply in a thread with the command list
// Everything else is acknowledged with a 200 and ignored. Notifications are
// not event-driven; they are pushed by src/lib/notifications/dispatcher.ts.
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

  let parsed: {
    type?: string
    challenge?: string
    team_id?: string
    event?: {
      type?: string
      channel?: string
      ts?: string
      thread_ts?: string
      tokens?: { bot?: string[] }
    }
  }
  try {
    parsed = JSON.parse(rawBody) as typeof parsed
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (parsed.type === 'url_verification' && typeof parsed.challenge === 'string') {
    return res.status(200).json({ challenge: parsed.challenge })
  }

  // The workspace id lives on the envelope (`team_id`), not on the inner
  // event, for both app_uninstalled and tokens_revoked.
  const teamId = typeof parsed.team_id === 'string' ? parsed.team_id : ''
  const eventType = parsed.type === 'event_callback' ? parsed.event?.type : undefined

  // app_uninstalled, or tokens_revoked for our bot token: the workspace can
  // no longer receive anything, so drop its rows. The deletes are awaited
  // before responding because serverless runtimes (Netlify) may freeze the
  // function once the response is sent. They are idempotent and fast, well
  // inside Slack's 3-second deadline; a retry after a failure is harmless.
  const botTokensRevoked = eventType === 'tokens_revoked' && (parsed.event?.tokens?.bot?.length ?? 0) > 0
  if ((eventType === 'app_uninstalled' || botTokensRevoked) && teamId !== '') {
    try {
      await removeWorkspace(teamId)
    } catch (e) {
      console.error(`${eventType} cleanup failed for ${teamId}`, e)
      return res.status(500).json({ error: 'Cleanup failed' })
    }
    return res.status(200).end()
  }

  // @MyMultiSig in a channel: answer in a thread with the command list.
  // Skip Slack's retries so a slow first reply doesn't post the help twice.
  const isRetry = req.headers['x-slack-retry-num'] != null
  if (eventType === 'app_mention' && !isRetry && teamId !== '' && typeof parsed.event?.channel === 'string') {
    try {
      await replyWithHelp(teamId, parsed.event.channel, parsed.event.thread_ts ?? parsed.event.ts)
    } catch (e) {
      console.error('app_mention reply failed', e)
    }
    return res.status(200).end()
  }

  // Any other event: acknowledge so Slack doesn't retry.
  return res.status(200).end()
}

const removeWorkspace = async (teamId: string): Promise<void> => {
  const db = getDb()
  await Promise.all([
    db.delete(slackWorkspaces).where(eq(slackWorkspaces.teamId, teamId)),
    db.delete(slackUserLinks).where(eq(slackUserLinks.teamId, teamId)),
    db.delete(slackChannelConfigs).where(eq(slackChannelConfigs.teamId, teamId))
  ])
}

const replyWithHelp = async (teamId: string, channel: string, threadTs: string | undefined): Promise<void> => {
  const db = getDb()
  const rows = await db
    .select({ botTokenEncrypted: slackWorkspaces.botTokenEncrypted })
    .from(slackWorkspaces)
    .where(eq(slackWorkspaces.teamId, teamId))
    .limit(1)
  if (rows.length === 0) return
  const help = helpMessage()
  await slackApi('chat.postMessage', {
    token: decryptToken(rows[0].botTokenEncrypted),
    json: { channel, text: help.text, blocks: help.blocks, ...(threadTs != null ? { thread_ts: threadTs } : {}) }
  })
}

export default handler
