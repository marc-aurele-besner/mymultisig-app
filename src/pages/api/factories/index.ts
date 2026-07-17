import { and, eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { factories } from '../../../lib/db/schema'
import { parseBody, parseQueryString, withVerifiedAs } from '../../../lib/api/middleware'

// /api/factories:
//   POST  addFactory   (idempotent insert; ignore when the same row exists)
//   GET   getFactories (owner-scoped list)
const addHandler = withVerifiedAs(
  (req) => (parseBody(req) as { ownerAddress?: string }).ownerAddress,
  async (req, res) => {
    const db = getDb()
    const doc = parseBody(req) as Record<string, unknown>
    if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.name) {
      return res.status(400).json({ message: 'Missing factory fields' })
    }
    const existing = await db
      .select({ id: factories.id })
      .from(factories)
      .where(
        and(
          sql`LOWER(${factories.ownerAddress}) = LOWER(${String(doc.ownerAddress)})`,
          eq(factories.chainId, Number(doc.chainId)),
          sql`LOWER(${factories.address}) = LOWER(${String(doc.address)})`
        )
      )
      .limit(1)
    if (existing.length === 0) {
      await db.insert(factories).values({
        ownerAddress: String(doc.ownerAddress),
        chainId: Number(doc.chainId),
        chainName: (doc.chainName as string) ?? '',
        address: String(doc.address),
        name: String(doc.name),
        version: (doc.version as string) ?? ''
      })
    }
    console.log('Factory upsert done')
    return res.status(200).json({ message: 'Factory upsert done' })
  }
)

const listHandler = withVerifiedAs(
  (req) => parseQueryString(req).ownerAddress,
  async (req, res) => {
    const db = getDb()
    const ownerAddress = parseQueryString(req).ownerAddress
    const rows = await db
      .select({
        chainId: factories.chainId,
        chainName: factories.chainName,
        address: factories.address,
        name: factories.name,
        version: factories.version
      })
      .from(factories)
      .where(sql`LOWER(${factories.ownerAddress}) = LOWER(${ownerAddress})`)
    return res.status(200).json({
      message: 'Data retrieved',
      content: rows.map((row) => ({
        chainId: Number(row.chainId),
        chainName: String(row.chainName ?? ''),
        address: String(row.address),
        name: String(row.name),
        version: String(row.version ?? ''),
        multiSigCount: 0
      }))
    })
  }
)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') return addHandler(req, res)
  if (req.method === 'GET') return listHandler(req, res)
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
