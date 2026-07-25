import { and, eq, sql } from 'drizzle-orm'
import { createPublicClient, formatEther, http, isAddress, type Chain } from 'viem'
import * as viemChains from 'viem/chains'

import networks from '../../constants/networks'
import { getDb } from '../db/neon'
import { addressBook } from '../db/schema'
import { addressBookEmbed, balanceEmbed, comingSoonEmbed, errorEmbed, helpEmbed } from './embeds'
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

const ROUTES: Record<string, (text: string) => Promise<DiscordInteractionResponse> | DiscordInteractionResponse> = {
  balance: handlerBalance,
  'address-book': handlerAddressBook,
  propose: () => handlerPropose(),
  sign: handlerSign,
  help: () => handlerHelp()
}

export const routeCommand = async (name: string, options: unknown): Promise<DiscordInteractionResponse> => {
  const handler = ROUTES[name]
  if (handler == null) {
    return errorEmbed(
      `Unknown command \`/${name}\`. Try \`/balance\`, \`/address-book\`, \`/propose\`, \`/sign\`, or \`/help\`.`
    )
  }
  try {
    return await handler(extractText(options))
  } catch (e) {
    return errorEmbed(`Command failed: ${(e as Error).message}`)
  }
}
