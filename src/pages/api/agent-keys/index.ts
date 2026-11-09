import { and, desc, isNull, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'
import { isAddress } from 'viem'

import { getDb } from '../../../lib/db/neon'
import { agentApiKeys } from '../../../lib/db/schema'
import { parseBody, withSession } from '../../../lib/api/middleware'
import {
  apiKeyDisplayPrefix,
  generateApiKey,
  hashApiKey,
  isApiKeyScope,
  toApiKeyInfo
} from '../../../lib/auth/apiKey'

// Agent API key management. SIWE-only on purpose (no apiKeyScope): a key can
// never list or mint other keys, so a leaked key can't escalate or persist.
const MAX_ACTIVE_KEYS = 20
const MAX_EXPIRY_DAYS = 365

const listHandler = withSession(async (_req, res, address) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(agentApiKeys)
    .where(sql`LOWER(${agentApiKeys.ownerAddress}) = ${address}`)
    .orderBy(desc(agentApiKeys.createdAt))
  return res.status(200).json({ content: rows.map(toApiKeyInfo) })
})

const createHandler = withSession(async (req, res, address) => {
  const body = parseBody<{
    name?: unknown
    scopes?: unknown
    walletAddresses?: unknown
    expiresInDays?: unknown
  }>(req)
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 64) : ''
  if (name === '') return res.status(400).json({ message: 'A key name is required' })
  if (!Array.isArray(body.scopes) || body.scopes.length === 0 || !body.scopes.every(isApiKeyScope))
    return res.status(400).json({ message: 'scopes must be a non-empty subset of read, propose, sign, manage' })
  const scopes = [...new Set(body.scopes)]
  const walletAddresses = body.walletAddresses ?? []
  if (!Array.isArray(walletAddresses) || !walletAddresses.every((a) => typeof a === 'string' && isAddress(a)))
    return res.status(400).json({ message: 'walletAddresses must be a list of addresses' })
  let expiresAt: Date | null = null
  if (body.expiresInDays != null) {
    const days = Number(body.expiresInDays)
    if (!Number.isInteger(days) || days < 1 || days > MAX_EXPIRY_DAYS)
      return res.status(400).json({ message: `expiresInDays must be between 1 and ${MAX_EXPIRY_DAYS}` })
    expiresAt = new Date(Date.now() + days * 86_400_000)
  }

  const db = getDb()
  const active = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(agentApiKeys)
    .where(and(sql`LOWER(${agentApiKeys.ownerAddress}) = ${address}`, isNull(agentApiKeys.revokedAt)))
  if ((active[0]?.count ?? 0) >= MAX_ACTIVE_KEYS)
    return res.status(409).json({ message: `At most ${MAX_ACTIVE_KEYS} active keys per wallet; revoke one first` })

  const key = generateApiKey()
  const [row] = await db
    .insert(agentApiKeys)
    .values({
      ownerAddress: address,
      name,
      keyPrefix: apiKeyDisplayPrefix(key),
      keyHash: hashApiKey(key),
      scopes,
      walletAddresses: (walletAddresses as string[]).map((a) => a.toLowerCase()),
      expiresAt
    })
    .returning()
  // The only time the full key leaves the server.
  return res.status(201).json({ content: { key, info: toApiKeyInfo(row) } })
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') return listHandler(req, res)
  if (req.method === 'POST') return createHandler(req, res)
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
