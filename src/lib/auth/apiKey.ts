import { createHash, randomBytes } from 'crypto'
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm'
import { NextApiRequest } from 'next'

import { getDb } from '../db/neon'
import { agentApiKeys, AgentApiKeyRow } from '../db/schema'

// Scoped API keys for AI agents and scripts (MCP server, CLI, SDK).
//
// - read:    list the key owner's wallets, address book, saved contracts
// - propose: queue a new multisig request (POST /api/multisig-requests)
// - sign:    add signatures / record execution (PATCH /api/multisig-requests/[id])
// - manage:  cancel, reset, delete requests; register wallets; address book writes
//
// A key acts as the wallet that minted it and is only accepted by endpoints
// that opt in with `apiKeyScope` (see src/lib/api/middleware.ts); everything
// else — key management, integrations, email, admin — stays SIWE-only.
export const API_KEY_SCOPES = ['read', 'propose', 'sign', 'manage'] as const
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number]

export const isApiKeyScope = (value: unknown): value is ApiKeyScope =>
  typeof value === 'string' && (API_KEY_SCOPES as readonly string[]).includes(value)

const KEY_PREFIX = 'mms_'
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

// mms_ + 32 base62 chars (~190 bits). Rejection sampling keeps it unbiased.
export const generateApiKey = (): string => {
  let out = ''
  while (out.length < 32) {
    for (const byte of randomBytes(48)) {
      if (byte < 248 && out.length < 32) out += BASE62[byte % 62]
    }
  }
  return `${KEY_PREFIX}${out}`
}

export const hashApiKey = (token: string): string => createHash('sha256').update(token).digest('hex')

// The first 12 characters ("mms_" + 8) identify a key in the settings list
// without revealing enough of it to be useful.
export const apiKeyDisplayPrefix = (token: string): string => token.slice(0, 12)

export const looksLikeApiKey = (token: string): boolean => /^mms_[0-9A-Za-z]{32}$/.test(token)

// The Bearer token on the request, or null when there is no Authorization header.
export const readBearerToken = (req: NextApiRequest): string | null => {
  const header = req.headers.authorization
  if (typeof header !== 'string') return null
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  return match ? match[1].trim() : null
}

export type ApiKeyCaller = {
  id: string
  address: string
  scopes: ApiKeyScope[]
  walletAllowlist: string[]
}

// Looks a Bearer token up by hash. Returns null for unknown, revoked or
// expired keys. Touches last_used_at at most once a minute per key.
export const resolveApiKey = async (token: string): Promise<ApiKeyCaller | null> => {
  if (!looksLikeApiKey(token)) return null
  const db = getDb()
  const rows = await db.select().from(agentApiKeys).where(eq(agentApiKeys.keyHash, hashApiKey(token))).limit(1)
  const row = rows[0]
  if (row == null || row.revokedAt != null) return null
  if (row.expiresAt != null && row.expiresAt.getTime() <= Date.now()) return null
  void db
    .update(agentApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(
      and(
        eq(agentApiKeys.id, row.id),
        or(isNull(agentApiKeys.lastUsedAt), lt(agentApiKeys.lastUsedAt, sql`NOW() - INTERVAL '1 minute'`))
      )
    )
    .catch(() => undefined)
  return {
    id: row.id,
    address: row.ownerAddress.toLowerCase(),
    scopes: (row.scopes ?? []).filter(isApiKeyScope),
    walletAllowlist: (row.walletAddresses ?? []).map((a) => a.toLowerCase())
  }
}

export type ApiKeyInfo = {
  id: string
  name: string
  keyPrefix: string
  scopes: ApiKeyScope[]
  walletAddresses: string[]
  createdAt: string | null
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
}

// Client-facing shape: never includes key_hash.
export const toApiKeyInfo = (row: AgentApiKeyRow): ApiKeyInfo => ({
  id: row.id,
  name: row.name,
  keyPrefix: row.keyPrefix,
  scopes: (row.scopes ?? []).filter(isApiKeyScope),
  walletAddresses: row.walletAddresses ?? [],
  createdAt: row.createdAt?.toISOString() ?? null,
  lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  expiresAt: row.expiresAt?.toISOString() ?? null,
  revokedAt: row.revokedAt?.toISOString() ?? null
})
