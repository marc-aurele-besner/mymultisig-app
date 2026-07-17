import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from 'uuid'

import { getSql } from '../../../lib/db/neon'
import { parseBody, parseQueryString, withVerifiedAs } from '../../../lib/api/middleware'

// /api/factories:
//   POST  addFactory   (idempotent insert; ignore when the same row exists)
//   GET   getFactories (owner-scoped list)
const addHandler = withVerifiedAs(
  (req) => (parseBody(req) as { ownerAddress?: string }).ownerAddress,
  async (req, res) => {
    const sql = getSql()
    const doc = parseBody(req) as Record<string, unknown>
    if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.name) {
      return res.status(400).json({ message: 'Missing factory fields' })
    }
    const existing = (await sql`
      SELECT id FROM factories
      WHERE LOWER(owner_address) = LOWER(${doc.ownerAddress})
        AND chain_id = ${doc.chainId}
        AND LOWER(address) = LOWER(${doc.address})
      LIMIT 1
    `) as { id: string }[]
    if (existing.length === 0) {
      await sql`
        INSERT INTO factories (id, owner_address, chain_id, chain_name, address, name, version)
        VALUES (${uuid()}, ${doc.ownerAddress}, ${doc.chainId}, ${doc.chainName ?? ''}, ${doc.address}, ${doc.name}, ${doc.version ?? ''})
      `
    }
    console.log('Factory upsert done')
    return res.status(200).json({ message: 'Factory upsert done' })
  }
)

const listHandler = withVerifiedAs(
  (req) => parseQueryString(req).ownerAddress,
  async (req, res) => {
    const sql = getSql()
    const ownerAddress = parseQueryString(req).ownerAddress
    const rows = (await sql`
      SELECT chain_id, chain_name, address, name, version FROM factories
      WHERE LOWER(owner_address) = LOWER(${ownerAddress})
    `) as Record<string, unknown>[]
    return res.status(200).json({
      message: 'Data retrieved',
      content: rows.map((row) => ({
        chainId: Number(row.chain_id),
        chainName: String(row.chain_name ?? ''),
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
