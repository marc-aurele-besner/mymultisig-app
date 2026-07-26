import { NextApiRequest, NextApiResponse } from 'next'

import { isSlackConfigured, slackConfig } from '../../../lib/slack/config'
import { routeCommand } from '../../../lib/slack/commandRouter'
import { readRawBody } from '../../../lib/slack/rawBody'
import { verifySlackRequest } from '../../../lib/slack/verify'

// POST /api/slack/commands — Slack slash command endpoint. Verifies the
// signature, dispatches to routeCommand, and serializes the Block Kit
// response. Slack expects < 3s total response time, so this handler does
// not do any DB writes — all data lookups live in routeCommand and are
// read-only.
//
// bodyParser:false is required so verifySlackRequest gets the exact raw
// body that Slack signed. The form-encoded body is parsed here.

export const config = { api: { bodyParser: false } }

const parseForm = (raw: string): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const pair of raw.split('&')) {
    if (pair === '') continue
    const eq = pair.indexOf('=')
    if (eq < 0) {
      out[decodeURIComponent(pair)] = ''
    } else {
      out[decodeURIComponent(pair.slice(0, eq))] = decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '))
    }
  }
  return out
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

  const form = parseForm(rawBody)
  const command = typeof form.command === 'string' ? form.command : ''
  const text = typeof form.text === 'string' ? form.text : ''
  // Slack's slash-command form carries the team, channel, and user ids;
  // /bind and /unbind need them to write the channel_configs row.
  const teamId = typeof form.team_id === 'string' ? form.team_id : undefined
  const channelId = typeof form.channel_id === 'string' ? form.channel_id : undefined
  const channelName = typeof form.channel_name === 'string' ? form.channel_name : undefined
  const userId = typeof form.user_id === 'string' ? form.user_id : undefined

  const response = await routeCommand({ command, text, teamId, channelId, channelName, userId })
  // Slack expects the response within 3s. We return application/json with
  // the Block Kit body; the response_type controls visibility
  // ('in_channel' for everyone, 'ephemeral' for the requester only).
  return res.status(200).json(response)
}

export default handler
