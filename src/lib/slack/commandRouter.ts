import { and, eq, sql } from 'drizzle-orm'
import { createPublicClient, formatEther, http, isAddress, type Chain } from 'viem'
import * as viemChains from 'viem/chains'

import networks from '../../constants/networks'
import { getDb } from '../db/neon'
import { addressBook } from '../db/schema'
import { slackChannelConfigs, slackWorkspaces } from '../db/schema'
import {
  addressBookMessage,
  balanceMessage,
  bindAnnouncementMessage,
  bindRemovedMessage,
  bindSuccessMessage,
  errorMessage,
  helpMessage,
  openInAppMessage
} from './blockKit'
import type { SlackSlashResponse } from './blockKit'
import { CHAIN_ALIASES } from './chainAliases'
import { decryptToken } from './crypto'
import { slackApi, SlackApiError } from './slackApi'

// Slash command dispatch. Each handler is async and returns a
// SlackSlashResponse. The handler at src/pages/api/slack/commands.ts is
// responsible for verifying the signature and serializing the response.
//
// Slash command bodies come in as application/x-www-form-urlencoded with
// `text` carrying everything after the command (e.g. '1 0xabc...' for
// /balance). The router is the single place that interprets those args.
//
// CommandContext was extended with teamId/channelId/channelName/userId
// for the /bind and /unbind handlers — Slack's slash-command form
// already carries these fields, so the route just populates them. Older
// handlers ignore the extra fields.

export const findChain = (raw: string): Chain | null => {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  // Numeric id
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed)
    return networks.find((c) => c.id === id) ?? null
  }
  // Name (case-insensitive). Aliases map to chain ids rather than names
  // because viem's display names don't match what people type
  // (mainnet.name is "Ethereum", optimism.name is "OP Mainnet").
  const lower = trimmed.toLowerCase()
  const aliasId = CHAIN_ALIASES[lower]
  if (aliasId != null) return networks.find((c) => c.id === aliasId) ?? null
  // Fall back to the display name, with spaces typed as `-` or `_` since
  // slash-command args are whitespace-separated ("polygon-mumbai").
  const name = lower.replace(/[-_]/g, ' ')
  return networks.find((c) => c.name.toLowerCase() === name) ?? null
}

const rpcFor = (chain: Chain): string | null => {
  // Prefer the Alchemy API key when set, falling back to the chain's
  // default public RPC. Alchemy gives much better rate limits for free
  // and matches the pattern in src/pages/api/get-assets.ts.
  const alchemy = process.env.ALCHEMY_API_KEY ?? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  if (alchemy != null && alchemy !== '') {
    // Best-effort slug map; falls back to the chain's public RPC.
    const slug =
      chain.id === 1
        ? 'eth-mainnet'
        : chain.id === 11155111
          ? 'eth-sepolia'
          : chain.id === 137
            ? 'polygon-mainnet'
            : chain.id === 10
              ? 'opt-mainnet'
              : chain.id === 42161
                ? 'arb-mainnet'
                : chain.id === 43114
                  ? 'avax-mainnet'
                  : chain.id === 56
                    ? 'bnb-mainnet'
                    : chain.id === 100
                      ? 'gnosis-mainnet'
                      : null
    if (slug != null) return `https://${slug}.g.alchemy.com/v2/${alchemy}`
  }
  // viem chains have a default public RPC; fall back to it.
   
  const publicRpc = (viemChains as any)[chain.name]?.rpcUrls?.default?.http?.[0]
  return publicRpc ?? null
}

const handlerBalance = async (text: string): Promise<SlackSlashResponse> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorMessage('Usage: `/balance <chain> <multisig>` — e.g. `/balance mainnet 0xabc...`')
  const chain = findChain(parts[0])
  if (chain == null)
    return errorMessage(`Unknown chain: \`${parts[0]}\`. Try \`mainnet\`, \`sepolia\`, \`1\`, \`11155111\`, etc.`)
  const address = parts[1]
  if (!isAddress(address)) return errorMessage(`Not a valid address: \`${address}\``)

  const rpc = rpcFor(chain)
  if (rpc == null) return errorMessage(`No RPC URL available for chain ${chain.name}`)

  const client = createPublicClient({ chain, transport: http(rpc) })
  try {
    const balance = await client.getBalance({ address: address as `0x${string}` })
    const eth = formatEther(balance)
    // 6 significant digits is enough for display; show full precision for
    // tiny balances.
    const formatted = balance === 0n ? '0' : Number(eth) < 0.0001 ? eth : Number(eth).toPrecision(6)
    return balanceMessage(chain.name, address, formatted)
  } catch (e) {
    return errorMessage(`Failed to read balance: ${(e as Error).message}`)
  }
}

const handlerAddressBook = async (text: string): Promise<SlackSlashResponse> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2)
    return errorMessage('Usage: `/address-book <chain> <address>` — e.g. `/address-book mainnet 0xabc...`')
  const chain = findChain(parts[0])
  if (chain == null) return errorMessage(`Unknown chain: \`${parts[0]}\``)
  const address = parts[1]
  if (!isAddress(address)) return errorMessage(`Not a valid address: \`${address}\``)

  const db = getDb()
  const rows = await db
    .select({ label: addressBook.label, kind: addressBook.kind, isPublic: addressBook.isPublic })
    .from(addressBook)
    .where(
      and(
        eq(addressBook.chainId, chain.id),
        sql`LOWER(${addressBook.address}) = LOWER(${address})`,
        eq(addressBook.isPublic, true)
      )
    )

  return addressBookMessage(
    chain.name,
    address,
    rows.map((r) => ({ label: r.label, kind: r.kind, isPublic: r.isPublic }))
  )
}

// Proposing and signing need the user's own wallet, so these two commands
// hand back a deep link into the app rather than acting from Slack.
const handlerPropose = (): SlackSlashResponse =>
  openInAppMessage(
    'Proposals are signed with your own wallet, so they are created in the app. Open your multisig and choose *New request*.',
    '/open-multisig',
    'Open the app'
  )

const handlerSign = (text: string): SlackSlashResponse => {
  const requestId = text.trim().split(/\s+/)[0] ?? ''
  if (requestId === '' || !/^[0-9a-f-]{8,}$/i.test(requestId)) {
    return errorMessage('Usage: `/sign <request_id>` — e.g. `/sign 7f3c1b2e-...`')
  }
  return openInAppMessage(
    'Signatures come from your own wallet. Open the request in the app to review and sign it.',
    `/request/${requestId}`,
    'Open the request'
  )
}

// Slack errors that mean the bot cannot write to the channel the command
// came from. /bind rolls back and tells the user how to fix it.
const CHANNEL_ACCESS_ERRORS = new Set(['not_in_channel', 'channel_not_found', 'is_archived', 'restricted_action'])

const handlerHelp = (): SlackSlashResponse => helpMessage()

// /bind <chain> <multisig> — bind the current channel to a multisig so
// new-request notifications post here. No wallet ownership check in the
// MVP (slash-command payloads don't carry a wallet; SIWE-in-chat is a
// follow-up). Audit trail via created_by = `slack:${userId}`.
const handlerBind = async (
  text: string,
  ctx: { teamId: string; channelId: string; channelName: string | null; userId: string }
): Promise<SlackSlashResponse> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorMessage('Usage: `/bind <chain> <multisig>` — e.g. `/bind mainnet 0xabc...`')
  const chain = findChain(parts[0])
  if (chain == null) return errorMessage(`Unknown chain: \`${parts[0]}\`. Try \`mainnet\`, \`sepolia\`, \`1\`, etc.`)
  const address = parts[1]
  if (!isAddress(address)) return errorMessage(`Not a valid address: \`${address}\``)
  const db = getDb()

  // The dispatcher joins bindings to slack_workspaces for the bot token, so a
  // binding in a workspace without a row would never deliver. That happens
  // when the app was installed from Slack's own "Install to Workspace" button
  // instead of our OAuth flow.
  const workspaces = await db
    .select({ botTokenEncrypted: slackWorkspaces.botTokenEncrypted })
    .from(slackWorkspaces)
    .where(eq(slackWorkspaces.teamId, ctx.teamId))
    .limit(1)
  if (workspaces.length === 0) {
    return openInAppMessage(
      ':warning: This workspace is not connected to MyMultiSig yet, so notifications could not be delivered. Sign in with your wallet and add the app from the Slack settings page, then run `/bind` again.',
      '/settings/slack',
      'Open Slack settings'
    )
  }

  let inserted = true
  try {
    await db.insert(slackChannelConfigs).values({
      teamId: ctx.teamId,
      channelId: ctx.channelId,
      channelName: ctx.channelName,
      multisigAddress: address,
      chainId: chain.id,
      createdBy: `slack:${ctx.userId}`
    })
  } catch (e) {
    // Unique-index conflict means the binding already exists — treat as a
    // success so the user gets a clear message either way.
    const msg = (e as Error).message
    if (!(msg.includes('unique') || msg.includes('duplicate') || msg.includes('idx_slack_channel_configs_binding'))) {
      return errorMessage(`Bind failed: ${msg}`)
    }
    inserted = false
  }
  if (!inserted) return bindSuccessMessage(chain.name, address)

  // Announce the binding in the channel. This is also the delivery check:
  // if the bot cannot post here, notifications would silently go nowhere,
  // so roll the binding back and say how to fix it.
  try {
    const announcement = bindAnnouncementMessage(chain.name, address, ctx.userId)
    await slackApi('chat.postMessage', {
      token: decryptToken(workspaces[0].botTokenEncrypted),
      json: { channel: ctx.channelId, text: announcement.text, blocks: announcement.blocks }
    })
  } catch (e) {
    await db
      .delete(slackChannelConfigs)
      .where(
        and(
          eq(slackChannelConfigs.teamId, ctx.teamId),
          eq(slackChannelConfigs.channelId, ctx.channelId),
          eq(slackChannelConfigs.chainId, chain.id),
          sql`LOWER(${slackChannelConfigs.multisigAddress}) = LOWER(${address})`
        )
      )
    if (e instanceof SlackApiError && e.errorCode != null && CHANNEL_ACCESS_ERRORS.has(e.errorCode)) {
      return errorMessage(
        `MyMultiSig can't post in this conversation (\`${e.errorCode}\`). For a private channel, run \`/invite @MyMultiSig\` and then \`/bind\` again. Direct messages and archived channels can't receive notifications.`
      )
    }
    return errorMessage(`Bind failed: ${(e as Error).message}`)
  }
  return bindSuccessMessage(chain.name, address)
}

// /unbind <chain> <multisig> — remove the binding. Same auth model as
// /bind: anyone in the channel can unbind (since they could rebind).
const handlerUnbind = async (
  text: string,
  ctx: { teamId: string; channelId: string }
): Promise<SlackSlashResponse> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorMessage('Usage: `/unbind <chain> <multisig>` — e.g. `/unbind mainnet 0xabc...`')
  const chain = findChain(parts[0])
  if (chain == null) return errorMessage(`Unknown chain: \`${parts[0]}\``)
  const address = parts[1]
  if (!isAddress(address)) return errorMessage(`Not a valid address: \`${address}\``)
  const db = getDb()
  try {
    await db
      .delete(slackChannelConfigs)
      .where(
        and(
          eq(slackChannelConfigs.teamId, ctx.teamId),
          eq(slackChannelConfigs.channelId, ctx.channelId),
          eq(slackChannelConfigs.chainId, chain.id),
          sql`LOWER(${slackChannelConfigs.multisigAddress}) = LOWER(${address})`
        )
      )
    return bindRemovedMessage(chain.name, address)
  } catch (e) {
    return errorMessage(`Unbind failed: ${(e as Error).message}`)
  }
}

export interface CommandContext {
  command: string
  text: string
  // Required for /bind and /unbind. The route at src/pages/api/slack/commands.ts
  // populates these from the form. Older handlers ignore them.
  teamId?: string
  channelId?: string
  channelName?: string | null
  userId?: string
}

const ROUTES: Record<string, (ctx: CommandContext) => Promise<SlackSlashResponse> | SlackSlashResponse> = {
  '/balance': ({ text }) => handlerBalance(text),
  '/address-book': ({ text }) => handlerAddressBook(text),
  '/propose': () => handlerPropose(),
  '/sign': ({ text }) => handlerSign(text),
  '/help': () => handlerHelp(),
  '/bind': (ctx) => {
    if (ctx.teamId == null || ctx.channelId == null || ctx.userId == null) {
      return errorMessage('Bind is unavailable: missing channel context. Open a Slack issue.')
    }
    return handlerBind(ctx.text, {
      teamId: ctx.teamId,
      channelId: ctx.channelId,
      channelName: ctx.channelName ?? null,
      userId: ctx.userId
    })
  },
  '/unbind': (ctx) => {
    if (ctx.teamId == null || ctx.channelId == null) {
      return errorMessage('Unbind is unavailable: missing channel context. Open a Slack issue.')
    }
    return handlerUnbind(ctx.text, { teamId: ctx.teamId, channelId: ctx.channelId })
  }
}

// `/multisig <sub> <args…>` is the namespaced form of every command, for
// workspaces where another app already owns `/bind` or `/balance`. It maps
// to the same route as `/<sub>`. A bare `/multisig` shows help.
export const resolveUmbrella = (ctx: CommandContext): CommandContext => {
  if (ctx.command !== '/multisig') return ctx
  const trimmed = ctx.text.trim()
  if (trimmed === '') return { ...ctx, command: '/help', text: '' }
  const [sub, ...rest] = trimmed.split(/\s+/)
  return { ...ctx, command: `/${sub.toLowerCase().replace(/^\//, '')}`, text: rest.join(' ') }
}

export const routeCommand = async (incoming: CommandContext): Promise<SlackSlashResponse> => {
  const ctx = resolveUmbrella(incoming)
  const handler = ROUTES[ctx.command]
  if (handler == null) {
    return errorMessage(
      `Unknown command \`${ctx.command}\`. Try \`/multisig help\` for the list of commands.`
    )
  }
  try {
    return await handler(ctx)
  } catch (e) {
    return errorMessage(`Command failed: ${(e as Error).message}`)
  }
}
