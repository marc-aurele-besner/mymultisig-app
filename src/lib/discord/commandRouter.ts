import { and, eq, sql } from 'drizzle-orm'
import { createPublicClient, formatEther, http, isAddress, type Chain } from 'viem'
import * as viemChains from 'viem/chains'

import networks from '../../constants/networks'
import { getDb } from '../db/neon'
import { addressBook, discordChannelConfigs } from '../db/schema'
import {
  addressBookEmbed,
  balanceEmbed,
  bindRemovedEmbed,
  bindSuccessEmbed,
  comingSoonEmbed,
  errorEmbed,
  helpEmbed
} from './embeds'
import type { DiscordInteractionResponse } from './embeds'

// Slash command dispatch. Each handler is async and returns a
// DiscordInteractionResponse. The handler at
// src/pages/api/discord/interactions.ts is responsible for verifying the
// signature and serializing the response.
//
// Discord slash command bodies arrive as JSON with the command name in
// `data.name` and the user's text (everything after the command) in
// `data.options[0]?.value` when the option is a string. The router is
// the single place that interprets those args, mirroring
// src/lib/slack/commandRouter.ts.
//
// CommandContext was extended with guildId/channelId/userId for the /bind
// and /unbind handlers. Discord interactions carry these fields in the
// top-level JSON body (guild_id, channel_id, user.id).

const findChain = (raw: string): Chain | null => {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  // Numeric id
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed)
    return networks.find((c) => c.id === id) ?? null
  }
  // Name (case-insensitive): "mainnet", "sepolia", "eth", "polygon", etc.
  const lower = trimmed.toLowerCase()
  const alias: Record<string, string> = {
    eth: 'mainnet',
    ethereum: 'mainnet',
    poly: 'polygon',
    matic: 'polygon',
    op: 'optimism',
    arb: 'arbitrum',
    avax: 'avalanche',
    bnb: 'bsc',
    gnosis: 'gnosis'
  }
  const name = alias[lower] ?? lower
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

// Discord slash commands send the user's text as a single string option
// called "input" in our registration. Extract it the same way the docs
// describe (data.options[0].value when the option is type 3 = STRING).
const extractText = (options: unknown): string => {
  if (!Array.isArray(options)) return ''
  const first = options[0] as { type?: number; value?: unknown } | undefined
  if (first == null || first.type !== 3) return ''
  return typeof first.value === 'string' ? first.value : ''
}

const handlerBalance = async (text: string): Promise<DiscordInteractionResponse> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorEmbed('Usage: `/balance <chain> <multisig>` — e.g. `/balance mainnet 0xabc...`')
  const chain = findChain(parts[0])
  if (chain == null)
    return errorEmbed(`Unknown chain: \`${parts[0]}\`. Try \`mainnet\`, \`sepolia\`, \`1\`, \`11155111\`, etc.`)
  const address = parts[1]
  if (!isAddress(address)) return errorEmbed(`Not a valid address: \`${address}\``)

  const rpc = rpcFor(chain)
  if (rpc == null) return errorEmbed(`No RPC URL available for chain ${chain.name}`)

  const client = createPublicClient({ chain, transport: http(rpc) })
  try {
    const balance = await client.getBalance({ address: address as `0x${string}` })
    const eth = formatEther(balance)
    // 6 significant digits is enough for display; show full precision for
    // tiny balances.
    const formatted = balance === 0n ? '0' : Number(eth) < 0.0001 ? eth : Number(eth).toPrecision(6)
    return balanceEmbed(chain.name, address, formatted)
  } catch (e) {
    return errorEmbed(`Failed to read balance: ${(e as Error).message}`)
  }
}

const handlerAddressBook = async (text: string): Promise<DiscordInteractionResponse> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2)
    return errorEmbed('Usage: `/address-book <chain> <address>` — e.g. `/address-book mainnet 0xabc...`')
  const chain = findChain(parts[0])
  if (chain == null) return errorEmbed(`Unknown chain: \`${parts[0]}\``)
  const address = parts[1]
  if (!isAddress(address)) return errorEmbed(`Not a valid address: \`${address}\``)

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

  return addressBookEmbed(
    chain.name,
    address,
    rows.map((r) => ({ label: r.label, kind: r.kind, isPublic: r.isPublic }))
  )
}

const handlerPropose = (): DiscordInteractionResponse =>
  comingSoonEmbed('Propose a transaction from Discord', '/open-multisig', 'Open the app')

const handlerSign = (text: string): DiscordInteractionResponse => {
  const requestId = text.trim().split(/\s+/)[0] ?? ''
  if (requestId === '' || !/^[0-9a-f-]{8,}$/i.test(requestId)) {
    return errorEmbed('Usage: `/sign <request_id>` — e.g. `/sign 7f3c1b2e-...`')
  }
  return comingSoonEmbed('Sign a request from Discord', `/request/${requestId}`, 'Open the request')
}

const handlerHelp = (): DiscordInteractionResponse => helpEmbed()

// /bind <chain> <multisig> — bind the current channel to a multisig.
// Same MVP-no-ownership-check model as Slack; audit via
// created_by = `discord:<userId>`.
const handlerBind = async (
  text: string,
  ctx: { guildId: string; channelId: string; userId: string }
): Promise<DiscordInteractionResponse> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorEmbed('Usage: `/bind <chain> <multisig>` — e.g. `/bind mainnet 0xabc...`')
  const chain = findChain(parts[0])
  if (chain == null) return errorEmbed(`Unknown chain: \`${parts[0]}\`. Try \`mainnet\`, \`sepolia\`, \`1\`, etc.`)
  const address = parts[1]
  if (!isAddress(address)) return errorEmbed(`Not a valid address: \`${address}\``)
  const db = getDb()
  try {
    await db.insert(discordChannelConfigs).values({
      guildId: ctx.guildId,
      channelId: ctx.channelId,
      multisigAddress: address,
      chainId: chain.id,
      createdBy: `discord:${ctx.userId}`
    })
    return bindSuccessEmbed(chain.name, address)
  } catch (e) {
    const msg = (e as Error).message
    if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('idx_discord_channel_configs_binding')) {
      return bindSuccessEmbed(chain.name, address)
    }
    return errorEmbed(`Bind failed: ${msg}`)
  }
}

// /unbind <chain> <multisig>.
const handlerUnbind = async (
  text: string,
  ctx: { guildId: string; channelId: string }
): Promise<DiscordInteractionResponse> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorEmbed('Usage: `/unbind <chain> <multisig>` — e.g. `/unbind mainnet 0xabc...`')
  const chain = findChain(parts[0])
  if (chain == null) return errorEmbed(`Unknown chain: \`${parts[0]}\``)
  const address = parts[1]
  if (!isAddress(address)) return errorEmbed(`Not a valid address: \`${address}\``)
  const db = getDb()
  try {
    await db
      .delete(discordChannelConfigs)
      .where(
        and(
          eq(discordChannelConfigs.guildId, ctx.guildId),
          eq(discordChannelConfigs.channelId, ctx.channelId),
          eq(discordChannelConfigs.chainId, chain.id),
          sql`LOWER(${discordChannelConfigs.multisigAddress}) = LOWER(${address})`
        )
      )
    return bindRemovedEmbed(chain.name, address)
  } catch (e) {
    return errorEmbed(`Unbind failed: ${(e as Error).message}`)
  }
}

export interface CommandContext {
  // Discord slash commands arrive as { type: 2, data: { name, options } }.
  // name + options are the original fields; guildId/channelId/userId are
  // extracted from the top-level interaction body.
  name: string
  options: unknown
  guildId?: string
  channelId?: string
  userId?: string
}

const ROUTES: Record<string, (ctx: CommandContext) => Promise<DiscordInteractionResponse> | DiscordInteractionResponse> = {
  balance: ({ options }) => handlerBalance(extractText(options)),
  'address-book': ({ options }) => handlerAddressBook(extractText(options)),
  propose: () => handlerPropose(),
  sign: ({ options }) => handlerSign(extractText(options)),
  help: () => handlerHelp(),
  bind: (ctx) => {
    if (ctx.guildId == null || ctx.channelId == null || ctx.userId == null) {
      return errorEmbed('Bind is unavailable: missing channel context. Open a GitHub issue.')
    }
    return handlerBind(extractText(ctx.options), {
      guildId: ctx.guildId,
      channelId: ctx.channelId,
      userId: ctx.userId
    })
  },
  unbind: (ctx) => {
    if (ctx.guildId == null || ctx.channelId == null) {
      return errorEmbed('Unbind is unavailable: missing channel context. Open a GitHub issue.')
    }
    return handlerUnbind(extractText(ctx.options), { guildId: ctx.guildId, channelId: ctx.channelId })
  }
}

export const routeCommand = async (ctx: CommandContext): Promise<DiscordInteractionResponse> => {
  const handler = ROUTES[ctx.name]
  if (handler == null) {
    return errorEmbed(
      `Unknown command \`/${ctx.name}\`. Try \`/balance\`, \`/address-book\`, \`/propose\`, \`/sign\`, \`/bind\`, \`/unbind\`, or \`/help\`.`
    )
  }
  try {
    return await handler(ctx)
  } catch (e) {
    return errorEmbed(`Command failed: ${(e as Error).message}`)
  }
}
