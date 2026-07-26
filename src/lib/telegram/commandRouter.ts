import { and, eq, sql } from 'drizzle-orm'
import { createPublicClient, formatEther, http, isAddress, type Chain } from 'viem'
import * as viemChains from 'viem/chains'

import networks from '../../constants/networks'
import { getDb } from '../db/neon'
import { addressBook, telegramChatConfigs } from '../db/schema'
import {
  addressBookMessage,
  balanceMessage,
  bindRemovedPayload,
  bindSuccessPayload,
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
//   /bind <chain> <multisig>     (bind this chat to a multisig)
//   /unbind <chain> <multisig>   (remove a binding)
//   /help
//
// Telegram's update payload is flat JSON: update.message.text is the
// full "/command args" string. The handler at
// src/pages/api/telegram/webhook.ts splits the text into a command name
// and the post-command text and calls routeCommand(ctx).
//
// Each handler returns a TelegramMessagePayload (a sendMessage shape)
// ready for telegramApi('sendMessage', { token, ...payload }). The
// handler attaches the bot token; this module never sees secrets.
//
// CommandContext was extended with installationId + telegramUserId for
// /bind and /unbind. The webhook route populates these from the active
// installation row + the message.from field.

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

// /bind <chain> <multisig> — bind this chat to a multisig. No ownership
// check in the MVP; audit via created_by = `telegram:<userId>`.
const handlerBind = async (
  chatId: number | string,
  text: string,
  ctx: { installationId: string; telegramUserId: number }
): Promise<TelegramMessagePayload> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorMessage(chatId, 'Usage: /bind <chain> <multisig> — e.g. /bind mainnet 0xabc...')
  const chain = findChain(parts[0])
  if (chain == null) return errorMessage(chatId, `Unknown chain: ${parts[0]}. Try mainnet, sepolia, 1, etc.`)
  const address = parts[1]
  if (!isAddress(address)) return errorMessage(chatId, `Not a valid address: ${address}`)
  const db = getDb()
  try {
    await db.insert(telegramChatConfigs).values({
      installationId: ctx.installationId,
      chatId: typeof chatId === 'string' ? Number(chatId) : chatId,
      multisigAddress: address,
      chainId: chain.id,
      createdBy: `telegram:${ctx.telegramUserId}`
    })
    return bindSuccessPayload(chatId, chain.name, address)
  } catch (e) {
    const msg = (e as Error).message
    if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('idx_telegram_chat_configs_binding')) {
      return bindSuccessPayload(chatId, chain.name, address)
    }
    return errorMessage(chatId, `Bind failed: ${msg}`)
  }
}

// /unbind <chain> <multisig>.
const handlerUnbind = async (
  chatId: number | string,
  text: string,
  ctx: { installationId: string }
): Promise<TelegramMessagePayload> => {
  const parts = text.trim().split(/\s+/)
  if (parts.length < 2) return errorMessage(chatId, 'Usage: /unbind <chain> <multisig> — e.g. /unbind mainnet 0xabc...')
  const chain = findChain(parts[0])
  if (chain == null) return errorMessage(chatId, `Unknown chain: ${parts[0]}`)
  const address = parts[1]
  if (!isAddress(address)) return errorMessage(chatId, `Not a valid address: ${address}`)
  const db = getDb()
  try {
    await db
      .delete(telegramChatConfigs)
      .where(
        and(
          eq(telegramChatConfigs.installationId, ctx.installationId),
          eq(telegramChatConfigs.chatId, typeof chatId === 'string' ? Number(chatId) : chatId),
          eq(telegramChatConfigs.chainId, chain.id),
          sql`LOWER(${telegramChatConfigs.multisigAddress}) = LOWER(${address})`
        )
      )
    return bindRemovedPayload(chatId, chain.name, address)
  } catch (e) {
    return errorMessage(chatId, `Unbind failed: ${(e as Error).message}`)
  }
}

export interface CommandContext {
  chatId: number | string
  command: string
  text: string
  installationId?: string
  telegramUserId?: number
}

const ROUTES: Record<string, (ctx: CommandContext) => Promise<TelegramMessagePayload> | TelegramMessagePayload> = {
  balance: ({ chatId, text }) => handlerBalance(chatId, text),
  'address-book': ({ chatId, text }) => handlerAddressBook(chatId, text),
  propose: ({ chatId }) => handlerPropose(chatId),
  sign: ({ chatId, text }) => handlerSign(chatId, text),
  help: ({ chatId }) => handlerHelp(chatId),
  bind: (ctx) => {
    if (ctx.installationId == null || ctx.telegramUserId == null) {
      return errorMessage(ctx.chatId, 'Bind is unavailable: missing installation context. Open a GitHub issue.')
    }
    return handlerBind(ctx.chatId, ctx.text, {
      installationId: ctx.installationId,
      telegramUserId: ctx.telegramUserId
    })
  },
  unbind: (ctx) => {
    if (ctx.installationId == null) {
      return errorMessage(ctx.chatId, 'Unbind is unavailable: missing installation context. Open a GitHub issue.')
    }
    return handlerUnbind(ctx.chatId, ctx.text, { installationId: ctx.installationId })
  }
}

export const routeCommand = async (ctx: CommandContext): Promise<TelegramMessagePayload> => {
  const handler = ROUTES[ctx.command]
  if (handler == null) {
    return errorMessage(
      ctx.chatId,
      `Unknown command /${ctx.command}. Try /balance, /address-book, /bind, /unbind, /propose, /sign, or /help.`
    )
  }
  try {
    return await handler(ctx)
  } catch (e) {
    return errorMessage(ctx.chatId, `Command failed: ${(e as Error).message}`)
  }
}
