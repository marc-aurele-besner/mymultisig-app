import type { MultiSigTransactionRequest } from '../../models/MultiSigs'
import { eq, sql } from 'drizzle-orm'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

import { decryptToken as decryptSlackToken } from '../slack/crypto'
import { decryptToken as decryptDiscordToken } from '../discord/crypto'
import { decryptToken as decryptTelegramToken } from '../telegram/crypto'
import { slackApi } from '../slack/slackApi'
import { newRequestMessage } from '../slack/blockKit'
import { discordApi } from '../discord/discordApi'
import { newRequestEmbed } from '../discord/embeds'
import { telegramApi } from '../telegram/telegramApi'
import { newRequestPayload } from '../telegram/messages'
import {
  slackChannelConfigs,
  slackWorkspaces,
  discordChannelConfigs,
  discordWorkspaces,
  telegramChatConfigs,
  telegramInstallations
} from '../db/schema'
import { getDb } from '../db/neon'

// Cross-cutting notification dispatcher. When a new multisig request is
// created on the server (POST /api/multisig-requests), this module fans
// the request out to every Slack channel, Discord channel, and Telegram
// chat bound to (multiSigAddress, chainId). Each channel's send is
// best-effort: one channel's failure never blocks the others or the
// original POST handler. Promise.allSettled collects per-channel
// rejections and logs them with channel identity; the per-platform
// postToX helpers decrypt their workspace token lazily so one bad
// encryption key only kills its own channel.

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

// Human label for a binding, used by failure logging in notifyNewRequest
// so an operator can grep the server log and find the exact send call
// that failed without cross-referencing a flat indexed array.
export interface ChannelLabel {
  // Short platform name, e.g. "slack".
  platform: 'slack' | 'discord' | 'telegram'
  // Free-form human label for the channel/chat.
  label: string
}

export interface SlackBoundChannel extends ChannelLabel {
  id: string
  teamId: string
  channelId: string
  channelName: string | null
  // Encrypted bot token for the workspace the binding lives under.
  // Decrypted lazily inside postToSlack so one workspace's bad key
  // can't take down the other bindings on this multisig.
  botTokenEncrypted: string
}

export interface DiscordBoundChannel extends ChannelLabel {
  id: string
  guildId: string
  channelId: string
  channelName: string | null
  botTokenEncrypted: string
}

export interface TelegramBoundChannel extends ChannelLabel {
  id: string
  installationId: string
  chatId: number
  chatTitle: string | null
  botTokenEncrypted: string
}

export interface BoundChannels {
  slack: SlackBoundChannel[]
  discord: DiscordBoundChannel[]
  telegram: TelegramBoundChannel[]
}

// Look up every binding for (multiSigAddress, chainId) across the three
// platforms. Each platform's query JOINs the binding table to the
// installation/workspace table to pull the encrypted bot token, which is
// kept encrypted on the BoundChannel and decrypted lazily inside the
// per-platform postToX helper. That isolation matters: a corrupt or
// rotated key in one workspace must not block sibling channels on the
// same multisig, and must not kill the other two platforms' fan-out.
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
    db
      .select({
        id: telegramChatConfigs.id,
        installationId: telegramChatConfigs.installationId,
        chatId: telegramChatConfigs.chatId,
        chatTitle: telegramChatConfigs.chatTitle,
        botTokenEncrypted: telegramInstallations.botTokenEncrypted
      })
      .from(telegramChatConfigs)
      .innerJoin(telegramInstallations, eq(telegramInstallations.id, telegramChatConfigs.installationId))
      .where(
        sql`LOWER(${telegramChatConfigs.multisigAddress}) = LOWER(${multiSigAddress}) AND ${telegramChatConfigs.chainId} = ${chainId}`
      )
  ])
  return {
    slack: slackRows.map((r) => ({
      platform: 'slack' as const,
      label: r.channelName != null ? `#${r.channelName} (${r.teamId})` : `${r.channelId} (${r.teamId})`,
      id: r.id,
      teamId: r.teamId,
      channelId: r.channelId,
      channelName: r.channelName,
      botTokenEncrypted: r.botTokenEncrypted
    })),
    discord: discordRows.map((r) => ({
      platform: 'discord' as const,
      label: r.channelName != null ? `#${r.channelName} (${r.guildId})` : `${r.channelId} (${r.guildId})`,
      id: r.id,
      guildId: r.guildId,
      channelId: r.channelId,
      channelName: r.channelName,
      botTokenEncrypted: r.botTokenEncrypted
    })),
    telegram: telegramRows.map((r) => ({
      platform: 'telegram' as const,
      label: r.chatTitle != null ? `${r.chatTitle} (${r.chatId})` : `chat ${r.chatId}`,
      id: r.id,
      installationId: r.installationId,
      chatId: r.chatId,
      chatTitle: r.chatTitle,
      botTokenEncrypted: r.botTokenEncrypted
    }))
  }
}

// ─── Dispatcher ──────────────────────────────────────────────────────────

// Fan a single new request out to every bound channel. Per-channel sends
// are awaited inside Promise.allSettled so one platform's failure never
// short-circuits the others, and a single bad decryption key only kills
// its own channel (the decrypt is lazy, inside postToX — see
// findBoundChannels for the rationale). Errors are logged with the
// channel's identity so an operator can grep for the matching send call.
export const notifyNewRequest = async (input: NewRequestInput): Promise<void> => {
  if (input.chainId == null) {
    // No chain context — we can't filter bindings. Log once and skip.
    console.warn('notifyNewRequest: chainId missing; skipping fan-out')
    return
  }
  const channels = await findBoundChannels(input.request.multiSigAddress, input.chainId)
  // Wrap each send with its channel identity so Promise.allSettled's
  // flat results array still names the failing channel in the log.
  // The decorator pattern (instead of mutating postToX) keeps the
  // per-platform helpers pure and easy to test in isolation.
  type Job = { label: string; platform: ChannelLabel['platform']; promise: Promise<void> }
  const jobs: Job[] = [
    ...channels.slack.map<Job>((s) => ({
      label: s.label,
      platform: 'slack',
      promise: postToSlack(s, input)
    })),
    ...channels.discord.map<Job>((d) => ({
      label: d.label,
      platform: 'discord',
      promise: postToDiscord(d, input)
    })),
    ...channels.telegram.map<Job>((t) => ({
      label: t.label,
      platform: 'telegram',
      promise: postToTelegram(t, input)
    }))
  ]
  const results = await Promise.allSettled(jobs.map((j) => j.promise))
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const job = jobs[i]
      console.error(`notifyNewRequest: ${job.platform} channel ${job.label} failed`, r.reason)
    }
  })
}

// ─── Per-platform post helpers ──────────────────────────────────────────

// Each helper decrypts its workspace token at the top so a corrupt key
// throws an Error that identifies the specific binding. Promise.allSettled
// in notifyNewRequest then swallows the rejection for that one channel
// without affecting the sibling channels or the other two platforms.

const postToSlack = async (channel: SlackBoundChannel, input: NewRequestInput): Promise<void> => {
  let botToken: string
  try {
    botToken = decryptSlackToken(channel.botTokenEncrypted)
  } catch (e) {
    throw new Error(`slack ${channel.label}: decrypt failed (${(e as Error).message})`)
  }
  const message = newRequestMessage(input)
  await slackApi('chat.postMessage', {
    token: botToken,
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
  let botToken: string
  try {
    botToken = decryptDiscordToken(channel.botTokenEncrypted)
  } catch (e) {
    throw new Error(`discord ${channel.label}: decrypt failed (${(e as Error).message})`)
  }
  const embed = newRequestEmbed(input)
  await discordApi(`channels/${encodeURIComponent(channel.channelId)}/messages`, {
    token: botToken,
    json: {
      embeds: embed.data.embeds,
      components: embed.data.components
    }
  })
}

// Telegram sendMessage with the per-binding chat_id. newRequestPayload's
// placeholder chat_id (0) is overridden here before posting.
const postToTelegram = async (channel: TelegramBoundChannel, input: NewRequestInput): Promise<void> => {
  let botToken: string
  try {
    botToken = decryptTelegramToken(channel.botTokenEncrypted)
  } catch (e) {
    throw new Error(`telegram ${channel.label}: decrypt failed (${(e as Error).message})`)
  }
  const payload = newRequestPayload(input)
  await telegramApi('sendMessage', {
    token: botToken,
    json: {
      ...payload,
      chat_id: channel.chatId
    }
  })
}