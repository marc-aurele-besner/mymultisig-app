import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { parseIdParam, withSession } from '../../../../lib/api/middleware'
import { getDb } from '../../../../lib/db/neon'
import { discordChannelConfigs, discordWorkspaces } from '../../../../lib/db/schema'

// DELETE /api/discord/channel-bindings/[bindingId] — remove a binding.
// withSession + manual `installed_by_wallet === verified` check on the
// parent discord_workspaces row (mirrors the workspace-uninstall
// pattern at src/pages/api/discord/workspaces/[guildId].ts).

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const handler = withSession(async (req, res, verified) => {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const rawId = parseIdParam(req)
  if (rawId == null || !UUID_RE.test(rawId)) {
    return res.status(400).json({ error: 'Missing or invalid bindingId' })
  }
  const db = getDb()
  const rows = await db
    .select({
      binding: discordChannelConfigs,
      guildInstalledBy: discordWorkspaces.installedByWallet
    })
    .from(discordChannelConfigs)
    .innerJoin(discordWorkspaces, eq(discordWorkspaces.guildId, discordChannelConfigs.guildId))
    .where(eq(discordChannelConfigs.id, rawId))
    .limit(1)
  if (rows.length === 0) return res.status(404).json({ error: 'Binding not found' })
  if (rows[0].guildInstalledBy == null || rows[0].guildInstalledBy.toLowerCase() !== verified) {
    return res.status(403).json({ error: 'This wallet did not install this guild' })
  }
  await db.delete(discordChannelConfigs).where(eq(discordChannelConfigs.id, rawId))
  return res.status(204).end()
})

export default handler