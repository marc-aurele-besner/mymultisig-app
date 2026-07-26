import type { MultiSigTransactionRequest } from '../../models/MultiSigs'

// Cross-cutting notification dispatcher. When a new multisig request is
// created on the server (POST /api/multisig-requests), this module fans
// the request out to every Slack channel, Discord channel, and Telegram
// chat bound to (multiSigAddress, chainId). Each platform's send is
// best-effort: one platform's failure never blocks the others or the
// original POST handler.
//
// Per-platform post helpers are filled in by commits 2/3/4 (Slack/Discord/
// Telegram). The dispatcher itself stays here so commit 5 can wire
// notifyNewRequest into the POST handler regardless of which platform
// branches are wired.

// ─── Input shape ─────────────────────────────────────────────────────────

export interface NewRequestInput {
  // The persisted request, as built by rowToMultiSigRequest.
  request: MultiSigTransactionRequest
  // Resolved from the matching multisig_wallets row. Null when the wallet
  // row is missing — the dispatcher short-circuits in that case.
  chainId: number | null
  chainName: string | null
  // multisig_wallets.threshold — needed for "N/M signatures" copy.
  threshold: number | null
  // explorerUrlForChain(chainId) — null when the chain is unknown.
  explorerUrl: string | null
}

// ─── Bound channel lookup ────────────────────────────────────────────────

export interface SlackBoundChannel {
  id: string
  teamId: string
  channelId: string
  channelName: string | null
  // Decrypted bot token for the workspace the binding lives under. Held
  // only in memory for the lifetime of the dispatcher call; never logged.
  botToken: string
}

export interface DiscordBoundChannel {
  id: string
  guildId: string
  channelId: string
  channelName: string | null
  botToken: string
}

export interface TelegramBoundChannel {
  id: string
  installationId: string
  chatId: number
  chatTitle: string | null
  botToken: string
}

export interface BoundChannels {
  slack: SlackBoundChannel[]
  discord: DiscordBoundChannel[]
  telegram: TelegramBoundChannel[]
}

// Look up every binding for (multiSigAddress, chainId) across the three
// platforms. Filled in by commits 2/3/4 (each adds its own query inside
// Promise.allSettled). Until then, returns all-empty arrays so the public
// surface is testable end-to-end.
export const findBoundChannels = async (
  _multiSigAddress: `0x${string}`,
  _chainId: number | null
): Promise<BoundChannels> => ({
  slack: [],
  discord: [],
  telegram: []
})

// ─── Dispatcher ──────────────────────────────────────────────────────────

// Fan a single new request out to every bound channel. Per-platform sends
// are awaited inside Promise.allSettled so one platform's failure never
// short-circuits the others. Errors are logged but never re-thrown.
export const notifyNewRequest = async (input: NewRequestInput): Promise<void> => {
  if (input.chainId == null) {
    // No chain context — we can't filter bindings. Log once and skip.
    console.warn('notifyNewRequest: chainId missing; skipping fan-out')
    return
  }
  const channels = await findBoundChannels(input.request.multiSigAddress, input.chainId)
  const results = await Promise.allSettled([
    ...channels.slack.map((s) => postToSlack(s, input)),
    ...channels.discord.map((d) => postToDiscord(d, input)),
    ...channels.telegram.map((t) => postToTelegram(t, input))
  ])
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      // We don't have the original channel here (Promise.allSettled
      // flattens), so log the index. Enough for the operator to grep the
      // server log for the matching send call.
      console.error(`notifyNewRequest: channel post ${i} failed`, r.reason)
    }
  })
}

// ─── Per-platform post helpers (filled in by commits 2/3/4) ─────────────

 
const postToSlack = async (_channel: SlackBoundChannel, _input: NewRequestInput): Promise<void> => {
  throw new Error('notifyNewRequest.postToSlack: not implemented (commit 2)')
}

 
const postToDiscord = async (_channel: DiscordBoundChannel, _input: NewRequestInput): Promise<void> => {
  throw new Error('notifyNewRequest.postToDiscord: not implemented (commit 3)')
}

 
const postToTelegram = async (_channel: TelegramBoundChannel, _input: NewRequestInput): Promise<void> => {
  throw new Error('notifyNewRequest.postToTelegram: not implemented (commit 4)')
}