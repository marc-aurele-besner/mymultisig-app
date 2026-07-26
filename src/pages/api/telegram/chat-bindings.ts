import { eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { withSession } from '../../../lib/api/middleware'
import { isAddress } from 'viem'
import { getDb } from '../../../lib/db/neon'
import { rowToTelegramChatConfig } from '../../../lib/db/mappers'
import { telegramChatConfigs, telegramInstallations } from '../../../lib/db/schema'

// GET  /api/telegram/chat-bindings                       — list verified wallet's bindings
// POST /api/telegram/chat-bindings                       — create a binding from settings
//
// Settings-page path for Telegram chat bindings (the slash-command
// path is /bind and /unbind in src/lib/telegram/commandRouter.ts).
// withSession + manual `installed_by_wallet === verified` check on the
// parent telegram_installations row.
//
// Telegram chat_id is a BIGINT (numeric user/group/chat id). The route
// accepts either a JSON number or a numeric string and coerces to
// number before insert.

const handler = withSession(async (req, res, verified) => {
  const db = getDb()

  if (req.method === 'GET') {
    const rows = await db
      .select({
        binding: telegramChatConfigs,
        installedBy: telegramInstallations.installedByWallet
      })
      .from(telegramChatConfigs)
      .innerJoin(telegramInstallations, eq(telegramInstallations.id, telegramChatConfigs.installationId))
      .where(sql`LOWER(${telegramInstallations.installedByWallet}) = LOWER(${verified})`)
    return res.status(200).json({ bindings: rows.map((r) => rowToTelegramChatConfig(r.binding)) })
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>
    const installationId = typeof body.installationId === 'string' ? body.installationId : ''
    const chatIdRaw = body.chatId
    const chatId = typeof chatIdRaw === 'number' ? chatIdRaw : typeof chatIdRaw === 'string' ? Number(chatIdRaw) : NaN
    const chatTitle = typeof body.chatTitle === 'string' ? body.chatTitle : null
    const multisigAddress = typeof body.multisigAddress === 'string' ? body.multisigAddress : ''
    const chainId = typeof body.chainId === 'number' ? body.chainId : Number(body.chainId)
    if (installationId === '' || !Number.isFinite(chatId) || multisigAddress === '') {
      return res.status(400).json({ error: 'Missing installationId, chatId, or multisigAddress' })
    }
    if (!isAddress(multisigAddress)) {
      return res.status(400).json({ error: 'Not a valid multisig address' })
    }
    if (!Number.isInteger(chainId) || chainId <= 0) {
      return res.status(400).json({ error: 'Missing or invalid chainId' })
    }
    const instRows = await db
      .select({ installedByWallet: telegramInstallations.installedByWallet })
      .from(telegramInstallations)
      .where(eq(telegramInstallations.id, installationId))
      .limit(1)
    if (instRows.length === 0) return res.status(404).json({ error: 'Installation not found' })
    if (instRows[0].installedByWallet == null || instRows[0].installedByWallet.toLowerCase() !== verified) {
      return res.status(403).json({ error: 'This wallet did not install this bot' })
    }
    try {
      const [row] = await db
        .insert(telegramChatConfigs)
        .values({
          installationId,
          chatId,
          chatTitle,
          multisigAddress,
          chainId,
          createdBy: `settings:${verified}`
        })
        .returning()
      if (row == null) throw new Error('insert returned no row')
      return res.status(201).json({ binding: rowToTelegramChatConfig(row) })
    } catch (e) {
      const msg = (e as Error).message
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('idx_telegram_chat_configs_binding')) {
        return res.status(409).json({ error: 'Binding already exists' })
      }
      throw e
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
})

export default handler