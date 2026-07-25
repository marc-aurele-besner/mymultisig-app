import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

import { withSession } from '../../../../lib/api/middleware'
import { decryptToken } from '../../../../lib/telegram/crypto'
import { getDb } from '../../../../lib/db/neon'
import { telegramChatConfigs, telegramInstallations, telegramUserLinks } from '../../../../lib/db/schema'
import { isInstallationId } from '../../../../lib/telegram/installations'
import { telegramApi, TelegramApiError } from '../../../../lib/telegram/telegramApi'

// DELETE /api/telegram/installations/[id] — uninstall the Telegram bot
// for the verified wallet. Decrypts the bot token, calls deleteWebhook
// (best-effort — if it fails we still clean up the local rows), then
// parallel-deletes the three telegram_* tables' rows.
//
// withSession is used (not withVerifiedAs): id is a UUID, not a wallet
// address, so the verified/claimed equality check would always reject.
// Instead we load the row, then compare installed_by_wallet to the
// verified wallet manually. parseIdParam from src/lib/api/middleware.ts
// only enforces that the path param is a non-empty string; we also
// check it matches the UUID shape before touching the DB.

const handler = withSession(async (req, res, verified) => {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const id = req.query.id
  const installationId = typeof id === 'string' ? id : null
  if (!isInstallationId(installationId)) {
    return res.status(400).json({ error: 'Missing or invalid installation id' })
  }

  const db = getDb()
  const rows = await db.select().from(telegramInstallations).where(eq(telegramInstallations.id, installationId)).limit(1)
  if (rows.length === 0) return res.status(404).json({ error: 'Installation not found' })
  const row = rows[0]
  if (row.installedByWallet == null || row.installedByWallet.toLowerCase() !== verified) {
    return res.status(403).json({ error: 'This wallet did not install this bot' })
  }

  // Best-effort deleteWebhook. If the token is stale or the call
  // fails for any reason, log and continue with the local deletes.
  try {
    const token = decryptToken(row.botTokenEncrypted)
    await telegramApi('deleteWebhook', { token })
  } catch (e) {
    const reason = e instanceof TelegramApiError ? `${e.method}: ${e.description ?? e.message}` : (e as Error).message
    console.error('telegram deleteWebhook failed; continuing with local delete', reason)
  }

  // The three tables are independent; run the deletes in parallel and
  // log if any of them fails (a re-install would also clean these up
  // as a backstop, so a partial failure is recoverable).
  await Promise.all([
    db.delete(telegramInstallations).where(eq(telegramInstallations.id, installationId)),
    db.delete(telegramUserLinks).where(eq(telegramUserLinks.installationId, installationId)),
    db.delete(telegramChatConfigs).where(eq(telegramChatConfigs.installationId, installationId))
  ]).catch((e) => {
    console.error('local delete failed during telegram uninstall', e)
    throw e
  })

  return res.status(204).end()
})

export default handler
