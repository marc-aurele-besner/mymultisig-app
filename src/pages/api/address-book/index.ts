import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from 'uuid'

import { getSql } from '../../../lib/db/neon'
import { parseBody, parseQueryString, withVerifiedAs } from '../../../lib/api/middleware'

// /api/address-book hosts three actions on one path:
//   POST   addAddressBookEntry     (idempotent upsert on (owner, chain, address))
//   GET    getAddressBook          (owner-scoped list, all chains)
//   DELETE removeAddressBookEntry  (delete one row by (owner, chain, address))
//
// The DELETE body carries the row identity on purpose — a query string with
// (ownerAddress, chainId, address) would be the only alternative, but having
// three query keys for a single row removal is uglier than a small body.

const addHandler = withVerifiedAs(
  (req) => (parseBody(req) as { ownerAddress?: string }).ownerAddress,
  async (req, res) => {
    const sql = getSql()
    const doc = parseBody(req) as Record<string, unknown>
    if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.label) {
      return res.status(400).json({ message: 'Missing address book fields' })
    }
    const existing = (await sql`
      SELECT id FROM address_book
      WHERE LOWER(owner_address) = LOWER(${doc.ownerAddress})
        AND chain_id = ${doc.chainId}
        AND LOWER(address) = LOWER(${doc.address})
      LIMIT 1
    `) as { id: string }[]
    if (existing.length > 0) {
      await sql`
        UPDATE address_book SET label = ${doc.label}, kind = ${doc.kind ?? 'wallet'}, is_public = ${doc.isPublic ?? false}
        WHERE id = ${existing[0].id}
      `
    } else {
      await sql`
        INSERT INTO address_book (id, owner_address, chain_id, address, label, kind, is_public)
        VALUES (${uuid()}, ${doc.ownerAddress}, ${doc.chainId}, ${doc.address}, ${doc.label}, ${doc.kind ?? 'wallet'}, ${doc.isPublic ?? false})
      `
    }
    console.log('Address book upsert done')
    return res.status(200).json({ message: 'Address book upsert done' })
  }
)

const removeHandler = withVerifiedAs(
  (req) => (parseBody(req) as { ownerAddress?: string }).ownerAddress,
  async (req, res) => {
    const sql = getSql()
    const doc = parseBody(req) as Record<string, unknown>
    if (!doc.ownerAddress || !doc.address || doc.chainId === undefined) {
      return res.status(400).json({ message: 'Missing address book fields' })
    }
    await sql`
      DELETE FROM address_book
      WHERE LOWER(owner_address) = LOWER(${doc.ownerAddress})
        AND chain_id = ${doc.chainId}
        AND LOWER(address) = LOWER(${doc.address})
    `
    console.log('Address book removal done')
    return res.status(200).json({ message: 'Address book removal done' })
  }
)

const listHandler = withVerifiedAs(
  (req) => parseQueryString(req).ownerAddress,
  async (req, res) => {
    const sql = getSql()
    const ownerAddress = parseQueryString(req).ownerAddress
    const rows = (await sql`
      SELECT id, chain_id, address, label, kind, is_public FROM address_book
      WHERE LOWER(owner_address) = LOWER(${ownerAddress})
    `) as Record<string, unknown>[]
    return res.status(200).json({
      message: 'Data retrieved',
      content: rows.map((row) => ({
        id: String(row.id),
        chainId: Number(row.chain_id),
        address: String(row.address),
        label: String(row.label),
        kind: String(row.kind),
        isPublic: Boolean(row.is_public)
      }))
    })
  }
)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') return addHandler(req, res)
  if (req.method === 'DELETE') return removeHandler(req, res)
  if (req.method === 'GET') return listHandler(req, res)
  res.setHeader('Allow', 'GET, POST, DELETE')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
