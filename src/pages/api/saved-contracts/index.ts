import { and, eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { savedContracts } from '../../../lib/db/schema'
import { parseBody, parseQueryString, withVerifiedAs } from '../../../lib/api/middleware'

// /api/saved-contracts:
//   POST  addSavedContract   (idempotent upsert on (owner, chain, address))
//   GET   getSavedContracts  (owner-scoped list)
const addHandler = withVerifiedAs(
  (req) => (parseBody(req) as { ownerAddress?: string }).ownerAddress,
  async (req, res) => {
    const db = getDb()
    const doc = parseBody(req) as Record<string, unknown>
    if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.name || doc.abi == null) {
      return res.status(400).json({ message: 'Missing saved contract fields' })
    }
    const existing = await db
      .select({ id: savedContracts.id })
      .from(savedContracts)
      .where(
        and(
          sql`LOWER(${savedContracts.ownerAddress}) = LOWER(${String(doc.ownerAddress)})`,
          eq(savedContracts.chainId, Number(doc.chainId)),
          sql`LOWER(${savedContracts.address}) = LOWER(${String(doc.address)})`
        )
      )
      .limit(1)
    if (existing.length > 0) {
      await db
        .update(savedContracts)
        .set({ name: String(doc.name), abi: doc.abi as unknown[] })
        .where(eq(savedContracts.id, existing[0].id))
    } else {
      await db.insert(savedContracts).values({
        ownerAddress: String(doc.ownerAddress),
        chainId: Number(doc.chainId),
        chainName: (doc.chainName as string) ?? '',
        address: String(doc.address),
        name: String(doc.name),
        abi: doc.abi as unknown[]
      })
    }
    console.log('Saved contract upsert done')
    return res.status(200).json({ message: 'Saved contract upsert done' })
  }
)

const listHandler = withVerifiedAs(
  (req) => parseQueryString(req).ownerAddress,
  async (req, res) => {
    const db = getDb()
    const ownerAddress = parseQueryString(req).ownerAddress
    const rows = await db
      .select({
        id: savedContracts.id,
        chainId: savedContracts.chainId,
        chainName: savedContracts.chainName,
        address: savedContracts.address,
        name: savedContracts.name,
        abi: savedContracts.abi
      })
      .from(savedContracts)
      .where(sql`LOWER(${savedContracts.ownerAddress}) = LOWER(${ownerAddress})`)
    return res.status(200).json({
      message: 'Data retrieved',
      content: rows.map((row) => ({
        id: String(row.id),
        chainId: Number(row.chainId),
        chainName: String(row.chainName ?? ''),
        address: String(row.address),
        name: String(row.name),
        abi: row.abi ?? []
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
