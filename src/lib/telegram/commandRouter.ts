import { and, eq, sql } from 'drizzle-orm'
import { createPublicClient, formatEther, http, isAddress, type Chain } from 'viem'
import * as viemChains from 'viem/chains'

import networks from '../../constants/networks'
import { getDb } from '../db/neon'
import { addressBook } from '../db/schema'
import {
  addressBookMessage,
  balanceMessage,
  comingSoonMessage,
  errorMessage,
  helpMessage,
  type TelegramMessagePayload
} from './messages'

// Slash command dispatch for Telegram. Same handler set as
// src/lib/discord/commandRouter.ts and src/lib/slack/commandRouter.ts:
//   /balance <chain> <multisig>
//   /address-book <chain> <address>
//   /propose                (stub — coming soon)
//   /sign <request_id>      (stub — coming soon)
//   /help
//
// Telegram's update payload is flat JSON: update.message.text is the
// full "/command args" string. The handler at
// src/pages/api/telegram/webhook.ts splits the text into a command name
// and the post-command text and calls routeCommand(command, args).
//
// Each handler returns a TelegramMessagePayload (a sendMessage shape)
// ready for telegramApi('sendMessage', { token, ...payload }). The
// handler attaches the bot token; this module never sees secrets.

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
  const publicRpc = (viemChains as any)[chain.name]?.rpcUrls?.default?.http?.[0]
  return publicRpc ?? null
}

const handlerBalance = async (chatId: number | string, text: string): Promise<TelegramMessagePayload> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorMessage(chatId, 'Usage: /balance <chain> <multisig> — e.g. /balance mainnet 0xabc...')
  const chain = findChain(parts[0])
  if (chain == null) return errorMessage(chatId, `Unknown chain: ${parts[0]}. Try mainnet, sepolia, 1, 11155111, etc.`)
  const address = parts[1]
  if (!isAddress(address)) return errorMessage(chatId, `Not a valid address: ${address}`)

  const rpc = rpcFor(chain)
  if (rpc == null) return errorMessage(chatId, `No RPC URL available for chain ${chain.name}`)

  const client = createPublicClient({ chain, transport: http(rpc) })
  try {
    const balance = await client.getBalance({ address: address as `0x${string}` })
    const eth = formatEther(balance)
    const formatted = balance === 0n ? '0' : Number(eth) < 0.0001 ? eth : Number(eth).toPrecision(6)
    return balanceMessage(chatId, chain.name, address, formatted)
  } catch (e) {
    return errorMessage(chatId, `Failed to read balance: ${(e as Error).message}`)
  }
}

const handlerAddressBook = async (chatId: number | string, text: string): Promise<TelegramMessagePayload> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2)
    return errorMessage(chatId, 'Usage: /address-book <chain> <address> — e.g. /address-book mainnet 0xabc...')
  const chain = findChain(parts[0])
  if (chain == null) return errorMessage(chatId, `Unknown chain: ${parts[0]}`)
  const address = parts[1]
  if (!isAddress(address)) return errorMessage(chatId, `Not a valid address: ${address}`)

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
    chatId,
    chain.name,
    address,
    rows.map((r) => ({ label: r.label, kind: r.kind, isPublic: r.isPublic }))
  )
}

const handlerPropose = (chatId: number | string): TelegramMessagePayload =>
  comingSoonMessage(chatId, 'Propose a transaction from Telegram', '/open-multisig', 'Open the app')

const handlerSign = (chatId: number | string, text: string): TelegramMessagePayload => {
  const requestId = text.trim().split(/\s+/)[0] ?? ''
  if (requestId === '' || !/^[0-9a-f-]{8,}$/i.test(requestId)) {
    return errorMessage(chatId, 'Usage: /sign <request_id> — e.g. /sign 7f3c1b2e-...')
  }
  return comingSoonMessage(chatId, 'Sign a request from Telegram', `/request/${requestId}`, 'Open the request')
}

const handlerHelp = (chatId: number | string): TelegramMessagePayload => helpMessage(chatId)

const ROUTES: Record<string, (chatId: number | string, text: string) => Promise<TelegramMessagePayload> | TelegramMessagePayload> = {
  balance: handlerBalance,
  'address-book': handlerAddressBook,
  propose: (chatId) => handlerPropose(chatId),
  sign: handlerSign,
  help: (chatId) => handlerHelp(chatId)
}

export const routeCommand = async (
  chatId: number | string,
  name: string,
  text: string
): Promise<TelegramMessagePayload> => {
  const handler = ROUTES[name]
  if (handler == null) {
    return errorMessage(
      chatId,
      `Unknown command /${name}. Try /balance, /address-book, /propose, /sign, or /help.`
    )
  }
  try {
    return await handler(chatId, text)
  } catch (e) {
    return errorMessage(chatId, `Command failed: ${(e as Error).message}`)
  }
}
