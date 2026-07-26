import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { parseIdParam, withSession } from '../../../../lib/api/middleware'
import { getDb } from '../../../../lib/db/neon'
import { telegramChatConfigs, telegramInstallations } from '../../../../lib/db/schema'

// DELETE /api/telegram/chat-bindings/[bindingId] — remove a binding.
// withSession + manual `installed_by_wallet === verified` check on the
// parent telegram_installations row (mirrors the installation-uninstall
// pattern at src/pages/api/telegram/installations/[id].ts).

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
      binding: telegramChatConfigs,
      installedBy: telegramInstallations.installedByWallet
    })
    .from(telegramChatConfigs)
    .innerJoin(telegramInstallations, eq(telegramInstallations.id, telegramChatConfigs.installationId))
    .where(eq(telegramChatConfigs.id, rawId))
    .limit(1)
  if (rows.length === 0) return res.status(404).json({ error: 'Binding not found' })
  if (rows[0].installedBy == null || rows[0].installedBy.toLowerCase() !== verified) {
    return res.status(403).json({ error: 'This wallet did not install this bot' })
  }
  await db.delete(telegramChatConfigs).where(eq(telegramChatConfigs.id, rawId))
  return res.status(204).end()
})

export default handler