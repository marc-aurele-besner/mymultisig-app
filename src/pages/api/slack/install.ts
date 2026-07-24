import { NextApiRequest, NextApiResponse } from 'next'

import { buildRedirectUri, isSlackConfigured, slackConfig } from '../../../lib/slack/config'
import { issueState } from '../../../lib/slack/state'

// GET /api/slack/install — start the OAuth flow. Mints a signed state
// cookie and redirects to Slack's authorize URL. The state is the only
// CSRF defense Slack offers (per
// https://api.slack.com/authentication/installing-with-oauth), so the cookie
// must be present and valid on the callback.
//
// Query params:
//   team    — optional Slack team id (forces install into a specific
//             workspace; omit for the workspace picker).
//   return_to — optional path on the app side to redirect to after install.
//
// Returns 503 when the app is not configured (missing env vars). The
// settings page can detect this and show a clear "set env vars" message.

const SCOPES = ['commands', 'chat:write', 'chat:write.public', 'users:read', 'app_mentions:read']

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isSlackConfigured()) {
    return res.status(503).json({ error: 'Slack app is not configured on this deployment' })
  }
  const { clientId } = slackConfig()
  const host = req.headers.host
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const redirectUri = buildRedirectUri(host, proto)

  const team = typeof req.query.team === 'string' ? req.query.team : undefined
  const returnTo = typeof req.query.return_to === 'string' ? req.query.return_to : undefined
  const state = issueState(res, {
    ...(returnTo !== undefined ? { returnTo } : {}),
    ...(team !== undefined ? { teamHint: team } : {})
  })

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SCOPES.join(','),
    redirect_uri: redirectUri,
    state
  })
  if (team != null && team !== '') params.set('team', team)

  return res.redirect(302, `https://slack.com/oauth/v2/authorize?${params.toString()}`)
}

export default handler
