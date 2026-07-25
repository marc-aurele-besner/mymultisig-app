import { NextApiRequest, NextApiResponse } from 'next'

import { getVerifiedAddress } from '../../../lib/auth/siwe'
import { buildRedirectUri, discordConfig, isDiscordConfigured } from '../../../lib/discord/config'
import { encryptToken } from '../../../lib/discord/crypto'
import { discordApi, DiscordApiError } from '../../../lib/discord/discordApi'
import { consumeState } from '../../../lib/discord/state'
import { getDb } from '../../../lib/db/neon'
import { discordWorkspaces } from '../../../lib/db/schema'

// GET /api/discord/oauth-callback — complete the OAuth flow. Verifies the
// state cookie (the only CSRF defense Discord offers), exchanges the code
// for a bot token, encrypts the token, and upserts the discord_workspaces
// row.
//
// The SIWE session is read opportunistically: if the user is signed in
// when they install, installed_by_wallet gets set; if not, the column
// stays null and the row is simply absent from any wallet's
// /api/discord/workspaces list.
//
// On success, redirects to {returnTo || /settings/discord}?installed=1.
// On failure, redirects to /settings/discord?installed=0&error=<code>.
//
// See https://discord.com/developers/docs/topics/oauth2#authorization-code-grant.

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isDiscordConfigured()) {
    return res.status(503).json({ error: 'Discord app is not configured on this deployment' })
  }
  const code = typeof req.query.code === 'string' ? req.query.code : null
  const state = typeof req.query.state === 'string' ? req.query.state : null
  if (code == null || state == null) {
    return res.status(400).json({ error: 'Missing code or state' })
  }
  // Discord also passes an `error` param when the user denies on the
  // consent screen. Surface it via the same redirect-to-settings path.
  const discordError = typeof req.query.error === 'string' ? req.query.error : null
  if (discordError != null) {
    return res.redirect(302, `/settings/discord?installed=0&error=${encodeURIComponent(discordError)}`)
  }

  const cookieState = consumeState(req, res, state)
  if (cookieState == null) {
    return res.redirect(302, '/settings/discord?installed=0&error=state_invalid')
  }

  const { clientId, clientSecret } = discordConfig()
  const host = req.headers.host
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  const redirectUri = buildRedirectUri(host, proto)

  let tokenResponse
  try {
    tokenResponse = await discordApi('oauth2/token', {
      form: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      }
    })
  } catch (e) {
    const errCode = e instanceof DiscordApiError ? (typeof e.code === 'string' ? e.code : 'oauth_failed') : 'oauth_failed'
    return res.redirect(302, `/settings/discord?installed=0&error=${encodeURIComponent(errCode)}`)
  }

  const accessToken = typeof tokenResponse.access_token === 'string' ? tokenResponse.access_token : null
  const guildId = tokenResponse.guild?.id
  const guildName = tokenResponse.guild?.name
  const applicationId = tokenResponse.application?.id
  const scope = typeof tokenResponse.scope === 'string' ? tokenResponse.scope : ''
  if (accessToken == null || guildId == null || guildName == null || applicationId == null) {
    return res.redirect(302, '/settings/discord?installed=0&error=incomplete_response')
  }

  const installedByWallet = getVerifiedAddress(req) // null when not signed in
  const botTokenEncrypted = encryptToken(accessToken)

  const db = getDb()
  // onConflictDoUpdate on guild_id so re-installs overwrite the bot token
  // (Discord rotates tokens on each install). installed_at and updated_at
  // both bump to NOW() — re-installs are fresh installs from Discord's view.
  await db
    .insert(discordWorkspaces)
    .values({
      guildId,
      guildName,
      botTokenEncrypted,
      applicationId,
      scope,
      installedByWallet
    })
    .onConflictDoUpdate({
      target: discordWorkspaces.guildId,
      set: {
        guildName,
        botTokenEncrypted,
        applicationId,
        scope,
        // Don't clobber an existing installed_by_wallet: a re-install from
        // a different browser should keep the original installer's wallet
        // attribution. Only fill it in if it was null.
        installedByWallet: installedByWallet ?? undefined,
        installedAt: new Date(),
        updatedAt: new Date()
      }
    })

  const returnTo = cookieState.returnTo ?? '/settings/discord'
  const sep = returnTo.includes('?') ? '&' : '?'
  return res.redirect(302, `${returnTo}${sep}installed=1`)
}

export default handler
