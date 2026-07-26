import { eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { withSession } from '../../../lib/api/middleware'
import { isAddress } from 'viem'
import { getDb } from '../../../lib/db/neon'
import { rowToDiscordChannelConfig } from '../../../lib/db/mappers'
import { discordChannelConfigs, discordWorkspaces } from '../../../lib/db/schema'

// GET  /api/discord/channel-bindings                       — list verified wallet's bindings
// POST /api/discord/channel-bindings                       — create a binding from settings
//
// Settings-page path for Discord channel bindings (the slash-command
// path is /bind and /unbind in src/lib/discord/commandRouter.ts).
// withSession + manual `installed_by_wallet === verified` check on the
// parent discord_workspaces row.

const handler = withSession(async (req, res, verified) => {
  const db = getDb()

  if (req.method === 'GET') {
    const rows = await db
      .select({
        binding: discordChannelConfigs,
        guildInstalledBy: discordWorkspaces.installedByWallet
      })
      .from(discordChannelConfigs)
      .innerJoin(discordWorkspaces, eq(discordWorkspaces.guildId, discordChannelConfigs.guildId))
      .where(sql`LOWER(${discordWorkspaces.installedByWallet}) = LOWER(${verified})`)
    return res.status(200).json({ bindings: rows.map((r) => rowToDiscordChannelConfig(r.binding)) })
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>
    const guildId = typeof body.guildId === 'string' ? body.guildId : ''
    const channelId = typeof body.channelId === 'string' ? body.channelId : ''
    const channelName = typeof body.channelName === 'string' ? body.channelName : null
    const multisigAddress = typeof body.multisigAddress === 'string' ? body.multisigAddress : ''
    const chainId = typeof body.chainId === 'number' ? body.chainId : Number(body.chainId)
    if (guildId === '' || channelId === '' || multisigAddress === '') {
      return res.status(400).json({ error: 'Missing guildId, channelId, or multisigAddress' })
    }
    if (!isAddress(multisigAddress)) {
      return res.status(400).json({ error: 'Not a valid multisig address' })
    }
    if (!Number.isInteger(chainId) || chainId <= 0) {
      return res.status(400).json({ error: 'Missing or invalid chainId' })
    }
    const wsRows = await db
      .select({ installedByWallet: discordWorkspaces.installedByWallet })
      .from(discordWorkspaces)
      .where(eq(discordWorkspaces.guildId, guildId))
      .limit(1)
    if (wsRows.length === 0) return res.status(404).json({ error: 'Guild not installed' })
    if (wsRows[0].installedByWallet == null || wsRows[0].installedByWallet.toLowerCase() !== verified) {
      return res.status(403).json({ error: 'This wallet did not install this guild' })
    }
    try {
      const [row] = await db
        .insert(discordChannelConfigs)
        .values({
          guildId,
          channelId,
          channelName,
          multisigAddress,
          chainId,
          createdBy: `settings:${verified}`
        })
        .returning()
      if (row == null) throw new Error('insert returned no row')
      return res.status(201).json({ binding: rowToDiscordChannelConfig(row) })
    } catch (e) {
      const msg = (e as Error).message
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('idx_discord_channel_configs_binding')) {
        return res.status(409).json({ error: 'Binding already exists' })
      }
      throw e
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
})

export default handler