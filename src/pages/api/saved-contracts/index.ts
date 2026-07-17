import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from 'uuid'

import { getSql } from '../../../lib/db/neon'
import { parseBody, parseQueryString, withVerifiedAs } from '../../../lib/api/middleware'

// /api/saved-contracts:
//   POST  addSavedContract   (idempotent upsert on (owner, chain, address))
//   GET   getSavedContracts  (owner-scoped list)
const addHandler = withVerifiedAs(
  (req) => (parseBody(req) as { ownerAddress?: string }).ownerAddress,
  async (req, res) => {
    const sql = getSql()
    const doc = parseBody(req) as Record<string, unknown>
    if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.name || doc.abi == null) {
      return res.status(400).json({ message: 'Missing saved contract fields' })
    }
    const existing = (await sql`
      SELECT id FROM saved_contracts
      WHERE LOWER(owner_address) = LOWER(${doc.ownerAddress})
        AND chain_id = ${doc.chainId}
        AND LOWER(address) = LOWER(${doc.address})
      LIMIT 1
    `) as { id: string }[]
    if (existing.length > 0) {
      await sql`
        UPDATE saved_contracts SET name = ${doc.name}, abi = ${JSON.stringify(doc.abi)}
        WHERE id = ${existing[0].id}
      `
    } else {
      await sql`
        INSERT INTO saved_contracts (id, owner_address, chain_id, chain_name, address, name, abi)
        VALUES (${uuid()}, ${doc.ownerAddress}, ${doc.chainId}, ${doc.chainName ?? ''}, ${doc.address}, ${doc.name}, ${JSON.stringify(doc.abi)})
      `
    }
    console.log('Saved contract upsert done')
    return res.status(200).json({ message: 'Saved contract upsert done' })
  }
)

const listHandler = withVerifiedAs(
  (req) => parseQueryString(req).ownerAddress,
  async (req, res) => {
    const sql = getSql()
    const ownerAddress = parseQueryString(req).ownerAddress
    const rows = (await sql`
      SELECT id, chain_id, chain_name, address, name, abi FROM saved_contracts
      WHERE LOWER(owner_address) = LOWER(${ownerAddress})
    `) as Record<string, unknown>[]
    return res.status(200).json({
      message: 'Data retrieved',
      content: rows.map((row) => ({
        id: String(row.id),
        chainId: Number(row.chain_id),
        chainName: String(row.chain_name ?? ''),
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
