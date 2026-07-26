import type { MultiSigTransactionRequest } from '../../models/MultiSigs'
import { eq, sql } from 'drizzle-orm'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

import { decryptToken } from '../slack/crypto'
import { slackApi } from '../slack/slackApi'
import { newRequestMessage } from '../slack/blockKit'
import { discordApi } from '../discord/discordApi'
import { newRequestEmbed } from '../discord/embeds'
import { slackChannelConfigs, slackWorkspaces, discordChannelConfigs, discordWorkspaces } from '../db/schema'
import { getDb } from '../db/neon'

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
// platforms. Each platform's query JOINs the binding table to the
// installation table to pull the encrypted bot token, which the caller
// decrypts in-memory. The decrypt happens lazily per channel inside
// postToSlack/postToDiscord/postToTelegram so one platform's bad key
// doesn't block the others.
//
// Until commit 4 (Telegram wiring) lands, the discord + telegram arrays
// are empty — commits 2/3 fill in their branches as they're wired.
export const findBoundChannels = async (
  multiSigAddress: `0x${string}`,
  chainId: number | null
): Promise<BoundChannels> => {
  if (chainId == null) {
    return { slack: [], discord: [], telegram: [] }
  }
  const db = getDb()
  const [slackRows, discordRows, telegramRows] = await Promise.all([
    db
      .select({
        id: slackChannelConfigs.id,
        teamId: slackChannelConfigs.teamId,
        channelId: slackChannelConfigs.channelId,
        channelName: slackChannelConfigs.channelName,
        botTokenEncrypted: slackWorkspaces.botTokenEncrypted
      })
      .from(slackChannelConfigs)
      .innerJoin(slackWorkspaces, eq(slackWorkspaces.teamId, slackChannelConfigs.teamId))
      .where(
        sql`LOWER(${slackChannelConfigs.multisigAddress}) = LOWER(${multiSigAddress}) AND ${slackChannelConfigs.chainId} = ${chainId}`
      ),
    db
      .select({
        id: discordChannelConfigs.id,
        guildId: discordChannelConfigs.guildId,
        channelId: discordChannelConfigs.channelId,
        channelName: discordChannelConfigs.channelName,
        botTokenEncrypted: discordWorkspaces.botTokenEncrypted
      })
      .from(discordChannelConfigs)
      .innerJoin(discordWorkspaces, eq(discordWorkspaces.guildId, discordChannelConfigs.guildId))
      .where(
        sql`LOWER(${discordChannelConfigs.multisigAddress}) = LOWER(${multiSigAddress}) AND ${discordChannelConfigs.chainId} = ${chainId}`
      ),
    Promise.resolve([] as TelegramBoundChannel[])
  ])
  return {
    slack: slackRows.map((r) => ({
      id: r.id,
      teamId: r.teamId,
      channelId: r.channelId,
      channelName: r.channelName,
      botToken: decryptToken(r.botTokenEncrypted)
    })),
    discord: discordRows.map((r) => ({
      id: r.id,
      guildId: r.guildId,
      channelId: r.channelId,
      channelName: r.channelName,
      botToken: decryptToken(r.botTokenEncrypted)
    })),
    telegram: telegramRows
  }
}

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

const postToSlack = async (channel: SlackBoundChannel, input: NewRequestInput): Promise<void> => {
  const message = newRequestMessage(input)
  await slackApi('chat.postMessage', {
    token: channel.botToken,
    json: {
      channel: channel.channelId,
      text: message.text,
      blocks: message.blocks
    }
  })
}

// Free-form channel post — Discord's POST /channels/{id}/messages. The
// interactions endpoint only returns type-4 responses, but this route is
// a regular HTTP call from our server, so we use the free-form shape.
// The embed + components from newRequestEmbed are reused as-is.
const postToDiscord = async (channel: DiscordBoundChannel, input: NewRequestInput): Promise<void> => {
  const embed = newRequestEmbed(input)
  await discordApi(`channels/${encodeURIComponent(channel.channelId)}/messages`, {
    token: channel.botToken,
    json: {
      embeds: embed.data.embeds,
      components: embed.data.components
    }
  })
}

const postToTelegram = async (_channel: TelegramBoundChannel, _input: NewRequestInput): Promise<void> => {
  throw new Error('notifyNewRequest.postToTelegram: not implemented (commit 4)')
}