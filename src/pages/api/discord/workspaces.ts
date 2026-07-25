import { sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { withSession } from '../../../lib/api/middleware'
import { getDb } from '../../../lib/db/neon'
import { rowToDiscordWorkspace } from '../../../lib/db/mappers'
import { discordWorkspaces } from '../../../lib/db/schema'

// GET /api/discord/workspaces — list the guilds the verified SIWE wallet
// installed the bot into. Returns the public-facing shape (no encrypted
// token; the mapper drops it and exposes hasToken: true instead).
//
// The /settings/discord page calls this on mount. Orphan rows (no
// installed_by_wallet) are excluded — they belong to no wallet. Mirrors
// /api/slack/workspaces with team_id → guild_id.

const handler = withSession(async (_req, res, verified) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(discordWorkspaces)
    .where(sql`LOWER(${discordWorkspaces.installedByWallet}) = LOWER(${verified})`)

  return res.status(200).json({
    workspaces: rows.map(rowToDiscordWorkspace)
  })
})

export default handler
