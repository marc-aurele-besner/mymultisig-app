import { NextApiRequest, NextApiResponse } from 'next'

import { buildRedirectUri, discordConfig, isDiscordConfigured } from '../../../lib/discord/config'
import { issueState } from '../../../lib/discord/state'

// GET /api/discord/install — start the OAuth flow. Mints a signed state
// cookie and redirects to Discord's authorize URL. The state is the only
// CSRF defense Discord offers (per
// https://discord.com/developers/docs/topics/oauth2#state), so the cookie
// must be present and valid on the callback.
//
// Query params:
//   guild_id — optional Discord guild id (forces install into a specific
//              guild; omit for the guild picker).
//   return_to — optional path on the app side to redirect to after install.
//
// The two scopes are:
//   'bot'                 — adds the bot user to the guild
//   'applications.commands' — registers slash commands for the bot
//
// permissions=0 means the bot requests no special permissions; the bot
// only needs Send Messages (the default) for slash command responses.
// Channel-bound new-request notifications (next PR) will need to revisit
// this when a separate channel-bindings UI is added.
//
// Returns 503 when the app is not configured (missing env vars). The
// settings page can detect this and show a clear "set env vars" message.

const SCOPES = ['bot', 'applications.commands']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isDiscordConfigured()) {
    return res.status(503).json({ error: 'Discord app is not configured on this deployment' })
  }
  const { clientId } = discordConfig()
  const host = req.headers.host
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const redirectUri = buildRedirectUri(host, proto)

  const guildId = typeof req.query.guild_id === 'string' ? req.query.guild_id : undefined
  const returnTo = typeof req.query.return_to === 'string' ? req.query.return_to : undefined
  const state = issueState(res, {
    ...(returnTo !== undefined ? { returnTo } : {}),
    ...(guildId !== undefined ? { guildHint: guildId } : {})
  })

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SCOPES.join(' '),
    permissions: '0',
    redirect_uri: redirectUri,
    response_type: 'code',
    state
  })
  if (guildId != null && guildId !== '') params.set('guild_id', guildId)

  return res.redirect(302, `https://discord.com/api/oauth2/authorize?${params.toString()}`)
}

export default handler
