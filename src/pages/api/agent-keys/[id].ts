import { and, eq, isNull, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { agentApiKeys } from '../../../lib/db/schema'
import { parseIdParam, withSession } from '../../../lib/api/middleware'
import { toApiKeyInfo } from '../../../lib/auth/apiKey'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Revoke an agent API key. SIWE-only, and scoped to the caller's own keys:
// another wallet's key id is a 404, not a 403, so ids can't be probed.
const revokeHandler = withSession(async (req, res, address) => {
  const id = parseIdParam(req)
  if (id == null || !UUID.test(id)) return res.status(400).json({ message: 'Invalid key id' })
  const db = getDb()
  const rows = await db
    .update(agentApiKeys)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(agentApiKeys.id, id),
        sql`LOWER(${agentApiKeys.ownerAddress}) = ${address}`,
        isNull(agentApiKeys.revokedAt)
      )
    )
    .returning()
  if (rows.length === 0) return res.status(404).json({ message: 'Key not found or already revoked' })
  return res.status(200).json({ content: toApiKeyInfo(rows[0]) })
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'DELETE') return revokeHandler(req, res)
  res.setHeader('Allow', 'DELETE')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
