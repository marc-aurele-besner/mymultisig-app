import { and, eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { withSession } from '../../../lib/api/middleware'
import { isAddress } from 'viem'
import { getDb } from '../../../lib/db/neon'
import { rowToSlackChannelConfig } from '../../../lib/db/mappers'
import { slackChannelConfigs, slackWorkspaces } from '../../../lib/db/schema'

// GET  /api/slack/channel-bindings                       — list the verified wallet's bindings
// POST /api/slack/channel-bindings                       — create a binding from the settings page
//
// Settings-page path for channel bindings (the slash-command path is
// /bind and /unbind in src/lib/slack/commandRouter.ts). Requires the
// verified SIWE wallet to match the parent workspace's
// installed_by_wallet — anyone with the bot installed sees their own
// bindings, no one else's.
//
// POST validates the multisig address with viem's isAddress, validates
// the chain id is one of our supported networks (numeric only — the
// alias map lives in the slash-command router), and upserts on the
// unique index (team_id, channel_id, multisig_address, chain_id).

const handler = withSession(async (req, res, verified) => {
  const db = getDb()

  if (req.method === 'GET') {
    // List bindings whose parent workspace was installed by the verified
    // wallet. JOIN on installed_by_wallet case-insensitive.
    const rows = await db
      .select({
        binding: slackChannelConfigs,
        teamInstalledBy: slackWorkspaces.installedByWallet
      })
      .from(slackChannelConfigs)
      .innerJoin(slackWorkspaces, eq(slackWorkspaces.teamId, slackChannelConfigs.teamId))
      .where(sql`LOWER(${slackWorkspaces.installedByWallet}) = LOWER(${verified})`)
    return res.status(200).json({ bindings: rows.map((r) => rowToSlackChannelConfig(r.binding)) })
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>
    const teamId = typeof body.teamId === 'string' ? body.teamId : ''
    const channelId = typeof body.channelId === 'string' ? body.channelId : ''
    const channelName = typeof body.channelName === 'string' ? body.channelName : null
    const multisigAddress = typeof body.multisigAddress === 'string' ? body.multisigAddress : ''
    const chainId = typeof body.chainId === 'number' ? body.chainId : Number(body.chainId)
    if (teamId === '' || channelId === '' || multisigAddress === '') {
      return res.status(400).json({ error: 'Missing teamId, channelId, or multisigAddress' })
    }
    if (!isAddress(multisigAddress)) {
      return res.status(400).json({ error: 'Not a valid multisig address' })
    }
    if (!Number.isInteger(chainId) || chainId <= 0) {
      return res.status(400).json({ error: 'Missing or invalid chainId' })
    }
    // Verify the workspace belongs to the verified wallet.
    const wsRows = await db
      .select({ installedByWallet: slackWorkspaces.installedByWallet })
      .from(slackWorkspaces)
      .where(eq(slackWorkspaces.teamId, teamId))
      .limit(1)
    if (wsRows.length === 0) return res.status(404).json({ error: 'Workspace not installed' })
    if (wsRows[0].installedByWallet == null || wsRows[0].installedByWallet.toLowerCase() !== verified) {
      return res.status(403).json({ error: 'This wallet did not install this workspace' })
    }
    try {
      const [row] = await db
        .insert(slackChannelConfigs)
        .values({
          teamId,
          channelId,
          channelName,
          multisigAddress,
          chainId,
          createdBy: `settings:${verified}`
        })
        .returning()
      if (row == null) throw new Error('insert returned no row')
      return res.status(201).json({ binding: rowToSlackChannelConfig(row) })
    } catch (e) {
      const msg = (e as Error).message
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('idx_slack_channel_configs_binding')) {
        return res.status(409).json({ error: 'Binding already exists' })
      }
      throw e
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
})

export default handler