import { eq, sql } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

import { withSession } from '../../../lib/api/middleware'
import { getDb } from '../../../lib/db/neon'
import { rowToTelegramInstallation } from '../../../lib/db/mappers'
import { telegramInstallations } from '../../../lib/db/schema'
import { encryptToken } from '../../../lib/telegram/crypto'
import { deactivateAllInstallations } from '../../../lib/telegram/installations'
import { generateWebhookSecret } from '../../../lib/telegram/secret'
import { telegramApi, TelegramApiError } from '../../../lib/telegram/telegramApi'
import { isTelegramConfigured, webhookUrl } from '../../../lib/telegram/config'

// GET  /api/telegram/installations         — list the bots the verified wallet registered
// POST /api/telegram/installations         — register a new bot (paste-token flow)
//
// Telegram has no OAuth. The user creates a bot via @BotFather, pastes
// the token here, and the server validates via getMe, registers the
// webhook, and stores the encrypted tokens. Because the webhook URL is
// global per bot (setWebhook accepts one URL per bot, and we only have
// one webhook endpoint registered), we treat at most one installation
// as active at a time — registering a second bot auto-disables the
// previous one. The partial unique index on telegram_installations.is_active
// enforces this at the DB level.
//
// 503 when TELEGRAM_TOKEN_ENCRYPTION_KEY is unset; 401 when the session
// cookie is missing; 400 when the token is invalid or getMe fails.

const handler = withSession(async (req, res, verified) => {
  if (!isTelegramConfigured()) {
    return res.status(503).json({ error: 'Telegram bot is not configured on this deployment' })
  }

  if (req.method === 'GET') {
    const db = getDb()
    const rows = await db
      .select()
      .from(telegramInstallations)
      .where(sql`LOWER(${telegramInstallations.installedByWallet}) = LOWER(${verified})`)
    return res.status(200).json({
      installations: rows.map(rowToTelegramInstallation)
    })
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as { token?: unknown }
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    if (token === '') {
      return res.status(400).json({ error: 'Missing bot token in request body' })
    }
    // BotFather issues tokens shaped like "123456:ABC-DEF..." — short
    // surface-level sanity check before we waste a getMe call.
    if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(token)) {
      return res.status(400).json({ error: 'Bot token does not look like a Telegram bot token' })
    }

    // 1. Validate via getMe. Surface the Telegram error code so the
    //    settings page can show a useful inline message.
    let meResult: { id?: number; username?: string }
    try {
      const me = await telegramApi('getMe', { token })
      meResult = (me.result ?? {}) as { id?: number; username?: string }
    } catch (e) {
      const desc = e instanceof TelegramApiError ? (e.description ?? 'invalid token') : (e as Error).message
      return res.status(400).json({ error: `getMe failed: ${desc}` })
    }
    if (typeof meResult.id !== 'number' || typeof meResult.username !== 'string') {
      return res.status(400).json({ error: 'getMe returned an incomplete result' })
    }

    // 2. Generate the webhook secret. We send it to Telegram via
    //    setWebhook and store it encrypted so the webhook handler can
    //    verify every delivery.
    const secret = generateWebhookSecret()
    const host = req.headers.host
    const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
    const url = webhookUrl(host, proto)

    try {
      await telegramApi('setWebhook', {
        token,
        json: {
          url,
          secret_token: secret,
          // Drop update types we don't handle to keep the delivery queue
          // small. Adding 'edited_message' is the next obvious expansion.
          allowed_updates: ['message', 'callback_query']
        }
      })
    } catch (e) {
      const desc = e instanceof TelegramApiError ? (e.description ?? 'setWebhook failed') : (e as Error).message
      return res.status(502).json({ error: `setWebhook failed: ${desc}` })
    }

    // 3. Register the slash commands at the same time. setMyCommands is
    //    idempotent and per-bot, so re-running it on every install is
    //    safe and avoids needing a separate "register commands" button.
    try {
      await telegramApi('setMyCommands', {
        token,
        json: {
          commands: [
            { command: 'balance', description: 'Show the native balance of a multisig on a chain' },
            { command: 'address-book', description: 'List the public labels for an address' },
            { command: 'propose', description: 'Propose a new request (coming soon)' },
            { command: 'sign', description: 'Open a request to sign (coming soon)' },
            { command: 'help', description: 'Show the command list' }
          ]
        }
      })
    } catch (e) {
      // Don't fail the install on a setMyCommands error — the bot still
      // works, commands just won't show up in the UI menu until the
      // next install. Log and continue.
      console.error('telegram setMyCommands failed; continuing with install', (e as Error).message)
    }

    // 4. Persist. Deactivate the previous active row, then insert the
    //    new one. Inside a transaction so a partial failure leaves the
    //    DB in the pre-install state.
    const db = getDb()
    const botTokenEncrypted = encryptToken(token)
    const webhookSecretEncrypted = encryptToken(secret)

    const inserted = await db.transaction(async (tx) => {
      const deactivated = await deactivateAllInstallations(tx as any)
      if (deactivated.length > 0) {
        console.warn(
          `telegram: deactivating ${deactivated.length} previous active installation(s) on new install`
        )
      }
      const [row] = await tx
        .insert(telegramInstallations)
        .values({
          botUsername: meResult.username as string,
          botId: meResult.id as number,
          botTokenEncrypted,
          webhookSecretEncrypted,
          installedByWallet: verified,
          isActive: true
        })
        .returning()
      if (row == null) throw new Error('telegram insert returned no row')
      return row
    })

    return res.status(201).json({ installation: rowToTelegramInstallation(inserted) })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
})

export default handler
