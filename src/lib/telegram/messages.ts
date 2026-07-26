// Telegram sendMessage payload builders. Mirrors src/lib/discord/embeds.ts
// and src/lib/slack/blockKit.ts with the platform-specific shapes:
//
//   - Discord: rich embeds + components (action rows of buttons).
//   - Slack:   Block Kit (section + context + actions blocks).
//   - Telegram: text + parse_mode + optional inline_keyboard.
//
// Telegram's inline_keyboard mirrors Discord's components for buttons —
// one row of buttons, each either a callback_data (next PR) or a url.
// parse_mode: 'HTML' is the lightest-weight mode; Telegram also accepts
// 'MarkdownV2' (more strict escaping) but HTML's <code>, <b>, <i>, <a>
// cover everything we need without the dash-escaping dance.
//
// All builders return the shape the webhook handler forwards to
// telegramApi('sendMessage', ...) — the handler is responsible for
// adding the bot token, so the builder doesn't carry secrets.
//
// newRequestPayload (added with the notifier) renders a "new request"
// notification. Used by src/lib/notifications/dispatcher.ts to fan out
// cross-cutting notifications.

import type { NewRequestInput } from '../notifications/dispatcher'

const APP_URL = (): string => process.env.NEXT_PUBLIC_APP_URL ?? 'https://mymultisig.app'

// Minimal HTML escape so user-supplied fields (chain aliases, addresses
// that fail isAddress, etc.) can't inject tags. Telegram is forgiving
// about broken HTML — it just renders the literal text — so this is a
// defense-in-depth nicety, not a hard requirement.
const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const shortenAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`

export interface TelegramInlineButton {
  text: string
  url?: string
  callback_data?: string
}

export type TelegramMessagePayload = {
  method: 'sendMessage'
  chat_id: number | string
  text: string
  parse_mode: 'HTML'
  reply_markup?: { inline_keyboard: TelegramInlineButton[][] }
  disable_web_page_preview?: boolean
}

const linkButton = (label: string, url: string): TelegramInlineButton => ({ text: label, url })

export const balanceMessage = (chatId: number | string, chainName: string, address: string, balanceEth: string): TelegramMessagePayload => ({
  method: 'sendMessage',
  chat_id: chatId,
  parse_mode: 'HTML',
  text: `💰 <b>Balance on ${escapeHtml(chainName)}</b>\n<code>${escapeHtml(balanceEth)}</code> ETH\n\nMultisig <code>${escapeHtml(address)}</code>`,
  reply_markup: { inline_keyboard: [[linkButton('Open in app', `${APP_URL()}/multisig/${address}`)]] }
})

export const addressBookMessage = (
  chatId: number | string,
  chainName: string,
  address: string,
  labels: { label: string; kind: string; isPublic: boolean }[]
): TelegramMessagePayload => {
  const description =
    labels.length === 0
      ? '<i>No labels in the public address book for this address.</i>'
      : labels.map((l) => `• <code>${escapeHtml(l.label)}</code> <i>(${escapeHtml(l.kind)}${l.isPublic ? ', public' : ''})</i>`).join('\n')
  return {
    method: 'sendMessage',
    chat_id: chatId,
    parse_mode: 'HTML',
    text: `📒 <b>Address book — ${escapeHtml(chainName)}</b>\n<code>${escapeHtml(address)}</code>\n\n${description}`,
    reply_markup: { inline_keyboard: [[linkButton('Open in app', `${APP_URL()}/multisig/${address}`)]] }
  }
}

export const comingSoonMessage = (
  chatId: number | string,
  feature: string,
  actionUrl: string,
  actionLabel: string
): TelegramMessagePayload => ({
  method: 'sendMessage',
  chat_id: chatId,
  parse_mode: 'HTML',
  text: `⏳ <b>${escapeHtml(feature)}</b>\nComing in the next release. For now, use the app.`,
  reply_markup: { inline_keyboard: [[linkButton(actionLabel, `${APP_URL()}${actionUrl}`)]] }
})

export const errorMessage = (chatId: number | string, text: string): TelegramMessagePayload => ({
  method: 'sendMessage',
  chat_id: chatId,
  parse_mode: 'HTML',
  text: `⚠️ <b>Error</b>\n${escapeHtml(text)}`
})

export const helpMessage = (chatId: number | string): TelegramMessagePayload => ({
  method: 'sendMessage',
  chat_id: chatId,
  parse_mode: 'HTML',
  text:
    '🤖 <b>MyMultiSig commands</b>\n\n' +
    '• <code>/balance &lt;chain&gt; &lt;multisig&gt;</code> — show the native balance\n' +
    '• <code>/address-book &lt;chain&gt; &lt;address&gt;</code> — list the public labels for an address\n' +
    '• <code>/propose</code> — propose a new request (coming soon)\n' +
    '• <code>/sign &lt;request_id&gt;</code> — open a request to sign (coming soon)\n' +
    '• <code>/help</code> — show this message'
})

// "New request" notification builder. Used by the dispatcher to post
// into every Telegram chat bound to (multisigAddress, chainId). chat_id
// is a placeholder (0) — the dispatcher overrides it with the per-
// binding chat id before posting. The text uses parse_mode: 'HTML' so we
// can bold labels and wrap addresses in <code> for monospace.
export const newRequestPayload = (input: NewRequestInput): TelegramMessagePayload => {
  const chainName = input.chainName ?? 'unknown chain'
  const threshold = input.threshold ?? '?'
  const requestUrl = `${APP_URL()}/request/${input.request.id}`
  const explorerUrl = input.explorerUrl ? `${input.explorerUrl}/address/${input.request.multiSigAddress}` : null

  return {
    method: 'sendMessage',
    chat_id: 0,
    parse_mode: 'HTML',
    text:
      `:sparkles: <b>New request on ${escapeHtml(chainName)}</b>\n` +
      `${escapeHtml(input.request.description)}\n\n` +
      `<b>Threshold:</b> ${input.request.signatures.length}/${threshold} signatures\n` +
      `<b>Submitter:</b> <code>${escapeHtml(shortenAddress(input.request.submitter))}</code>\n` +
      `<b>Multisig:</b> <code>${escapeHtml(input.request.multiSigAddress)}</code>`,
    reply_markup: {
      inline_keyboard: [
        [
          linkButton('View request', requestUrl),
          ...(explorerUrl != null ? [linkButton('View on explorer', explorerUrl)] : [])
        ]
      ]
    }
  }
}
