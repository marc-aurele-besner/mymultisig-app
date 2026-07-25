import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { parseIdParam, withSession } from '../../../../lib/api/middleware'
import { isDiscordConfigured } from '../../../../lib/discord/config'
import { decryptToken } from '../../../../lib/discord/crypto'
import { discordApi, DiscordApiError } from '../../../../lib/discord/discordApi'
import { getDb } from '../../../../lib/db/neon'
import { discordChannelConfigs, discordUserLinks, discordWorkspaces } from '../../../../lib/db/schema'

// DELETE /api/discord/workspaces/[guildId] — uninstall the Discord bot
// from a guild the verified wallet installed it into. Decrypts the bot
// token, calls the token-revocation endpoint on Discord, then deletes all
// three discord_* tables' rows for that guild. Returns 204.
//
// withSession is used (not withVerifiedAs): guildId is a guild ID, not a
// wallet address, so the verified/claimed equality check would always
// reject. Instead we load the row, then compare installed_by_wallet to
// the verified wallet manually.
//
// Discord has no apps.uninstall equivalent. The closest is a bot-side
// guild.leave call (PUT /users/@me/guilds/{guild.id}), which is
// best-effort: if the token is stale or the bot is no longer in the
// guild, log and continue with the local deletes. Discord will not send
// any event for the local rows in that case.

const handler = withSession(async (req, res, verified) => {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const guildId = parseIdParam(req)
  if (guildId == null) return res.status(400).json({ error: 'Missing guildId' })

  const db = getDb()
  const rows = await db.select().from(discordWorkspaces).where(eq(discordWorkspaces.guildId, guildId)).limit(1)
  if (rows.length === 0) return res.status(404).json({ error: 'Workspace not found' })
  const row = rows[0]
  if (row.installedByWallet == null || row.installedByWallet.toLowerCase() !== verified) {
    return res.status(403).json({ error: 'This wallet did not install this workspace' })
  }

  // Best-effort leave from Discord. If the token is stale or the call
  // fails for any reason, log and continue with the local deletes.
  if (isDiscordConfigured()) {
    try {
      const token = decryptToken(row.botTokenEncrypted)
      // DELETE /users/@me/guilds/{guild.id} — the bot leaves the guild
      // and the row stops being visible in any user's Discord client.
      // See https://discord.com/developers/docs/resources/user#leave-guild.
      const res2 = await fetch(`https://discord.com/api/v10/users/@me/guilds/${encodeURIComponent(guildId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bot ${token}` }
      })
      if (!res2.ok && res2.status !== 204) {
        console.error('discord guild leave failed; continuing with local delete', res2.status)
      }
    } catch (e) {
      const reason = e instanceof DiscordApiError ? `${e.path}: ${e.message}` : (e as Error).message
      console.error('discord guild leave failed; continuing with local delete', reason)
    }
  }

  // The three tables are independent; run the deletes in parallel and
  // log if any of them fails (a re-install would also clean these up
  // as a backstop, so a partial failure is recoverable).
  await Promise.all([
    db.delete(discordWorkspaces).where(eq(discordWorkspaces.guildId, guildId)),
    db.delete(discordUserLinks).where(eq(discordUserLinks.guildId, guildId)),
    db.delete(discordChannelConfigs).where(eq(discordChannelConfigs.guildId, guildId))
  ]).catch((e) => {
    console.error('local delete failed during uninstall', e)
    throw e
  })

  return res.status(204).end()
})

export default handler
