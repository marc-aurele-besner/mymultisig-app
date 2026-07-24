import { NextApiRequest, NextApiResponse } from 'next'

import { getVerifiedAddress } from '../../../lib/auth/siwe'
import { buildRedirectUri, isSlackConfigured, slackConfig } from '../../../lib/slack/config'
import { encryptToken } from '../../../lib/slack/crypto'
import { slackApi, SlackApiError } from '../../../lib/slack/slackApi'
import { consumeState } from '../../../lib/slack/state'
import { getDb } from '../../../lib/db/neon'
import { slackWorkspaces } from '../../../lib/db/schema'

// GET /api/slack/oauth-callback — complete the OAuth flow. Verifies the
// state cookie (the only CSRF defense Slack offers), exchanges the code for
// a bot token, encrypts the token, and upserts the slack_workspaces row.
//
// The SIWE session is read opportunistically: if the user is signed in
// when they install, installed_by_wallet gets set; if not, the column
// stays null and the row is simply absent from any wallet's
// /api/slack/workspaces list.
//
// On success, redirects to {returnTo || /settings/slack}?installed=1.
// On failure, redirects to /settings/slack?installed=0&error=<code>.

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isSlackConfigured()) {
    return res.status(503).json({ error: 'Slack app is not configured on this deployment' })
  }
  const code = typeof req.query.code === 'string' ? req.query.code : null
  const state = typeof req.query.state === 'string' ? req.query.state : null
  if (code == null || state == null) {
    return res.status(400).json({ error: 'Missing code or state' })
  }
  // Slack also passes an `error` param when the user denies on the consent
  // screen. Surface it via the same redirect-to-settings path.
  const slackError = typeof req.query.error === 'string' ? req.query.error : null
  if (slackError != null) {
    return res.redirect(302, `/settings/slack?installed=0&error=${encodeURIComponent(slackError)}`)
  }

  const cookieState = consumeState(req, res, state)
  if (cookieState == null) {
    return res.redirect(302, '/settings/slack?installed=0&error=state_invalid')
  }

  const { clientId, clientSecret } = slackConfig()
  const host = req.headers.host
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const redirectUri = buildRedirectUri(host, proto)

  let tokenResponse
  try {
    tokenResponse = await slackApi('oauth.v2.access', {
      form: { client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }
    })
  } catch (e) {
    const code = e instanceof SlackApiError ? (e.errorCode ?? 'oauth_failed') : 'oauth_failed'
    return res.redirect(302, `/settings/slack?installed=0&error=${encodeURIComponent(code)}`)
  }

  const accessToken = typeof tokenResponse.access_token === 'string' ? tokenResponse.access_token : null
  const teamId = tokenResponse.team?.id
  const teamName = tokenResponse.team?.name
  const botUserId = tokenResponse.bot_user_id
  const scope = typeof tokenResponse.scope === 'string' ? tokenResponse.scope : ''
  if (accessToken == null || teamId == null || teamName == null || botUserId == null) {
    return res.redirect(302, '/settings/slack?installed=0&error=incomplete_response')
  }

  const installedByWallet = getVerifiedAddress(req) // null when not signed in
  const botTokenEncrypted = encryptToken(accessToken)

  const db = getDb()
  // onConflictDoUpdate on team_id so re-installs overwrite the bot token
  // (Slack rotates tokens on each install). installed_at and updated_at
  // both bump to NOW() — re-installs are fresh installs from Slack's view.
  await db
    .insert(slackWorkspaces)
    .values({
      teamId,
      teamName,
      botTokenEncrypted,
      botUserId,
      scope,
      installedByWallet
    })
    .onConflictDoUpdate({
      target: slackWorkspaces.teamId,
      set: {
        teamName,
        botTokenEncrypted,
        botUserId,
        scope,
        // Don't clobber an existing installed_by_wallet: a re-install from
        // a different browser should keep the original installer's wallet
        // attribution. Only fill it in if it was null.
        installedByWallet: installedByWallet ?? undefined,
        installedAt: new Date(),
        updatedAt: new Date()
      }
    })

  const returnTo = cookieState.returnTo ?? '/settings/slack'
  const sep = returnTo.includes('?') ? '&' : '?'
  return res.redirect(302, `${returnTo}${sep}installed=1`)
}

export default handler
