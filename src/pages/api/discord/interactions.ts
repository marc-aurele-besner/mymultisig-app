import { NextApiRequest, NextApiResponse } from 'next'

import { routeCommand } from '../../../lib/discord/commandRouter'
import { discordConfig, isDiscordConfigured } from '../../../lib/discord/config'
import { readRawBody } from '../../../lib/discord/rawBody'
import { verifyDiscordRequest } from '../../../lib/discord/verify'

// POST /api/discord/interactions — Discord's single endpoint for every
// interaction (PING, slash commands, component clicks, modal submits).
// Verifies the Ed25519 signature, then dispatches by `type`:
//   1 (PING)             — return { type: 1 } (PONG). Required for the
//                          endpoint URL to be accepted on the developer
//                          portal.
//   2 (APPLICATION_COMMAND) — call routeCommand(name, options) and
//                          return its DiscordInteractionResponse.
//   3 (MESSAGE_COMPONENT) — 200-acknowledge for the foundation. The next
//                          PR wires button / select handlers.
//
// bodyParser:false is required so verifyDiscordRequest sees the exact
// raw body that Discord signed. With bodyParser off, req.body is null —
// do not pass this request through parseBody from
// src/lib/api/middleware.ts.
//
// See https://discord.com/developers/docs/interactions/receiving-and-responding.

export const config = { api: { bodyParser: false } }

interface DiscordInteraction {
  type?: number
  data?: { name?: string; options?: unknown }
  // 4 = guild, 1 = DM. Used for routing channel-bound notifications in
  // the next PR; the foundation only logs them.
  guild_id?: string
  channel_id?: string
  user?: { id?: string }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isDiscordConfigured()) {
    return res.status(503).json({ error: 'Discord app is not configured on this deployment' })
  }

  const rawBody = await readRawBody(req)
  const signature = req.headers['x-signature-ed25519']
  const timestamp = req.headers['x-signature-timestamp']
  const { publicKey } = discordConfig()
  if (!verifyDiscordRequest({ publicKey, signature, timestamp, rawBody })) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  let parsed: DiscordInteraction
  try {
    parsed = JSON.parse(rawBody) as DiscordInteraction
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  // PING → PONG. Discord sends this once when the endpoint URL is saved
  // on the developer portal; the response must be exactly { type: 1 }.
  if (parsed.type === 1) {
    return res.status(200).json({ type: 1 })
  }

  if (parsed.type === 2 && parsed.data != null) {
    const name = typeof parsed.data.name === 'string' ? parsed.data.name : ''
    const response = await routeCommand(name, parsed.data.options)
    // Discord expects the response within 3s. We return the type-4
    // channel-message shape with embeds + components directly.
    return res.status(200).json(response)
  }

  if (parsed.type === 3) {
    // MESSAGE_COMPONENT — 200-acknowledge for the foundation. The next
    // PR routes by data.component_type / data.custom_id.
    return res.status(200).end()
  }

  // 5 (MODAL_SUBMIT) and any future interaction types fall through to
  // 400 so we notice them in dev. Discord will retry unknown types.
  return res.status(400).json({ error: `Unsupported interaction type: ${parsed.type ?? 'unknown'}` })
}

export default handler
