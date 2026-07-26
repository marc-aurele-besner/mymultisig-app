import type { NextApiRequest, NextApiResponse } from 'next'

import { isTelegramConfigured } from '../../../lib/telegram/config'
import { decryptToken } from '../../../lib/telegram/crypto'
import { findActiveInstallation } from '../../../lib/telegram/installations'
import { getDb } from '../../../lib/db/neon'
import { routeCommand } from '../../../lib/telegram/commandRouter'
import { telegramApi } from '../../../lib/telegram/telegramApi'
import { readRawBody } from '../../../lib/telegram/rawBody'
import { verifyTelegramSecret } from '../../../lib/telegram/verify'

// POST /api/telegram/webhook — Telegram's update delivery endpoint.
//
// Authentication: the X-Telegram-Bot-Api-Secret-Token header must match
// the secret we generated and stored when the bot was installed. There
// is no body signature and no timestamp check — Telegram handles
// delivery retries server-side via the strictly-increasing update_id.
//
// Dispatch:
//   - update.message.text starts with "/" → routeCommand(command, text)
//   - update.message without leading "/" → 200 (the bot ignores it)
//   - update.callback_query → 200 (foundation; the next PR wires buttons)
//   - any other update type → 200 (no-op so Telegram doesn't retry)
//
// We always return 200 on a successful secret match — Telegram retries
// non-2xx within ~30s, and the 3-second response deadline is enforced
// by the client closing the connection if we take too long. Errors
// inside routeCommand fall back to errorMessage('Internal error') so a
// bad handler can never turn into a 5xx → retry storm.
//
// bodyParser:false is required so we read the raw bytes verbatim —
// header-only verification means we don't need to verify the body,
// but reading from req.body would still be unreliable when bodyParser
// is on (Next parses the JSON, mutating whitespace).
//
// See https://core.telegram.org/bots/api#making-requests.

export const config = { api: { bodyParser: false } }

interface TelegramUpdate {
  update_id?: number
  message?: {
    message_id?: number
    chat?: { id?: number | string; type?: string; title?: string }
    from?: { id?: number; is_bot?: boolean; first_name?: string }
    text?: string
  }
  edited_message?: unknown
  callback_query?: { id?: string; data?: string; from?: { id?: number }; message?: unknown }
  // Any other update type — we no-op on these.
  [key: string]: any
}

// Strip the leading "/<command>" and split into (command, args). Returns
// null if the text doesn't start with "/", so the webhook can no-op on
// regular chat messages (the bot only answers slash commands for now).
const parseCommand = (
  text: string
): { command: string; args: string } | null => {
  if (!text.startsWith('/')) return null
  const trimmed = text.slice(1)
  // Telegram sends "/command@botusername args" when the bot is one of
  // several in a group. Strip the @bot suffix so the router sees just
  // the command name.
  const spaceIdx = trimmed.search(/\s/)
  const head = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
  const tail = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1)
  const atIdx = head.indexOf('@')
  const command = atIdx === -1 ? head : head.slice(0, atIdx)
  if (command === '') return null
  return { command, args: tail }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isTelegramConfigured()) {
    return res.status(503).json({ error: 'Telegram bot is not configured on this deployment' })
  }

  let rawBody: string
  try {
    rawBody = await readRawBody(req)
  } catch (e) {
    console.error('telegram webhook: failed to read raw body', (e as Error).message)
    return res.status(400).json({ error: 'Could not read request body' })
  }

  const provided = req.headers['x-telegram-bot-api-secret-token']
  if (typeof provided !== 'string' || provided === '') {
    // 401 here is the right answer for a missing credential. Telegram
    // does not retry on 401s, so this won't trigger a retry storm.
    return res.status(401).json({ error: 'Missing X-Telegram-Bot-Api-Secret-Token' })
  }

  // Look up the active installation. There should be exactly one (the
  // partial unique index enforces it) — if there are zero or many,
  // log and 401 so we don't accidentally run the bot with no config.
  const db = getDb()
  const installation = await findActiveInstallation(db)
  if (installation == null) {
    console.error('telegram webhook: no active installation in DB')
    return res.status(503).json({ error: 'No active Telegram installation' })
  }

  const expectedSecret = (() => {
    try {
      return decryptToken(installation.webhookSecretEncrypted)
    } catch (e) {
      console.error('telegram webhook: failed to decrypt webhook secret', (e as Error).message)
      return null
    }
  })()
  if (expectedSecret == null) return res.status(503).json({ error: 'Webhook secret unreadable' })

  if (!verifyTelegramSecret({ provided, expected: expectedSecret })) {
    return res.status(401).json({ error: 'Invalid webhook secret' })
  }

  let update: TelegramUpdate
  try {
    update = JSON.parse(rawBody) as TelegramUpdate
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  // message update with a leading "/" — dispatch the slash command.
  if (update.message?.text != null) {
    const parsed = parseCommand(update.message.text)
    const chatId = update.message.chat?.id
    if (parsed != null && chatId != null) {
      try {
        const payload = await routeCommand({
          chatId,
          command: parsed.command,
          text: parsed.args,
          installationId: installation.id,
          telegramUserId: update.message.from?.id
        })
        await telegramApi('sendMessage', {
          token: decryptToken(installation.botTokenEncrypted),
          json: payload as unknown as Record<string, unknown>
        })
      } catch (e) {
        console.error('telegram webhook: command handler failed', (e as Error).message)
      }
    }
    // 200 even when we no-op'd (non-command message) or errored — never
    // trigger Telegram's retry loop on a transient app failure.
    return res.status(200).end()
  }

  // callback_query — foundation no-op; the next PR wires inline-keyboard
  // handlers to the same router as the slash commands.
  if (update.callback_query != null) {
    return res.status(200).end()
  }

  // Any other update type — 200 and forget.
  return res.status(200).end()
}

export default handler
