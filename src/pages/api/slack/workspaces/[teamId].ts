import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { withSession } from '../../../../lib/api/middleware'
import { isSlackConfigured, slackConfig } from '../../../../lib/slack/config'
import { decryptToken } from '../../../../lib/slack/crypto'
import { slackApi, SlackApiError } from '../../../../lib/slack/slackApi'
import { getDb } from '../../../../lib/db/neon'
import { slackChannelConfigs, slackUserLinks, slackWorkspaces } from '../../../../lib/db/schema'
import { parseIdParam } from '../../../../lib/api/middleware'

// DELETE /api/slack/workspaces/[teamId] — uninstall the Slack app from a
// workspace the verified wallet installed. Decrypts the bot token, calls
// apps.uninstall on Slack, then deletes all three slack_* tables' rows
// for that team. Returns 204.
//
// withSession is used (not withVerifiedAs): teamId is a workspace ID,
// not a wallet address, so the verified/claimed equality check would
// always reject. Instead we load the row, then compare
// installed_by_wallet to the verified wallet manually.
//
// apps.uninstall is best-effort: if it fails (e.g. token rotated), we
// log and continue with the local deletes. The app_uninstalled event
// from Slack is the source of truth either way.

const handler = withSession(async (req, res, verified) => {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const teamId = parseIdParam(req)
  if (teamId == null) return res.status(400).json({ error: 'Missing teamId' })

  const db = getDb()
  const rows = await db.select().from(slackWorkspaces).where(eq(slackWorkspaces.teamId, teamId)).limit(1)
  if (rows.length === 0) return res.status(404).json({ error: 'Workspace not found' })
  const row = rows[0]
  if (row.installedByWallet == null || row.installedByWallet.toLowerCase() !== verified) {
    return res.status(403).json({ error: 'This wallet did not install this workspace' })
  }

  // Best-effort uninstall at Slack. If the token is stale or the call
  // fails for any reason, log and continue with the local deletes.
  if (isSlackConfigured()) {
    try {
      const { clientId, clientSecret } = slackConfig()
      const token = decryptToken(row.botTokenEncrypted)
      await slackApi('apps.uninstall', {
        form: { client_id: clientId, client_secret: clientSecret, token }
      })
    } catch (e) {
      const reason = e instanceof SlackApiError ? `${e.method}: ${e.message}` : (e as Error).message
      console.error('apps.uninstall failed; continuing with local delete', reason)
    }
  }

  // The three tables are independent; run the deletes in parallel and log
  // if any of them fails (the app_uninstalled event would also clean these
  // up as a backstop, so a partial failure is recoverable).
  await Promise.all([
    db.delete(slackWorkspaces).where(eq(slackWorkspaces.teamId, teamId)),
    db.delete(slackUserLinks).where(eq(slackUserLinks.teamId, teamId)),
    db.delete(slackChannelConfigs).where(eq(slackChannelConfigs.teamId, teamId))
  ]).catch((e) => {
    console.error('local delete failed during uninstall', e)
    throw e
  })

  return res.status(204).end()
})

export default handler
