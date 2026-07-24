import { sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { withSession } from '../../../lib/api/middleware'
import { getDb } from '../../../lib/db/neon'
import { rowToSlackWorkspace } from '../../../lib/db/mappers'
import { slackWorkspaces } from '../../../lib/db/schema'

// GET /api/slack/workspaces — list the workspaces the verified SIWE
// wallet installed. Returns the public-facing shape (no encrypted token;
// the mapper drops it and exposes hasToken: true instead).
//
// The /settings/slack page calls this on mount. Orphan rows (no
// installed_by_wallet) are excluded — they belong to no wallet.

const handler = withSession(async (_req, res, verified) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(slackWorkspaces)
    .where(sql`LOWER(${slackWorkspaces.installedByWallet}) = LOWER(${verified})`)

  return res.status(200).json({
    workspaces: rows.map(rowToSlackWorkspace)
  })
})

export default handler
