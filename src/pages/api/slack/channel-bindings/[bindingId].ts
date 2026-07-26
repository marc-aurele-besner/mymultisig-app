import { eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { parseIdParam, withSession } from '../../../../lib/api/middleware'
import { getDb } from '../../../../lib/db/neon'
import { slackChannelConfigs, slackWorkspaces } from '../../../../lib/db/schema'

// DELETE /api/slack/channel-bindings/[bindingId] — remove a binding.
// withSession + manual `installed_by_wallet === verified` check on the
// parent workspace (matching the workspace-uninstall pattern at
// src/pages/api/slack/workspaces/[teamId].ts).
//
// bindingId is a UUID (Drizzle's id column). parseIdParam from
// src/lib/api/middleware.ts only checks non-empty; we also require a
// valid UUID shape to fail fast on garbage input.

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
      binding: slackChannelConfigs,
      teamInstalledBy: slackWorkspaces.installedByWallet
    })
    .from(slackChannelConfigs)
    .innerJoin(slackWorkspaces, eq(slackWorkspaces.teamId, slackChannelConfigs.teamId))
    .where(eq(slackChannelConfigs.id, rawId))
    .limit(1)
  if (rows.length === 0) return res.status(404).json({ error: 'Binding not found' })
  if (rows[0].teamInstalledBy == null || rows[0].teamInstalledBy.toLowerCase() !== verified) {
    return res.status(403).json({ error: 'This wallet did not install this workspace' })
  }
  await db.delete(slackChannelConfigs).where(eq(slackChannelConfigs.id, rawId))
  return res.status(204).end()
})

export default handler