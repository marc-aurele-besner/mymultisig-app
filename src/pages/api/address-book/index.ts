import { and, eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { addressBook } from '../../../lib/db/schema'
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
    const db = getDb()
    const doc = parseBody(req) as Record<string, unknown>
    if (!doc.ownerAddress || !doc.address || doc.chainId === undefined || !doc.label) {
      return res.status(400).json({ message: 'Missing address book fields' })
    }
    const existing = await db
      .select({ id: addressBook.id })
      .from(addressBook)
      .where(
        and(
          sql`LOWER(${addressBook.ownerAddress}) = LOWER(${String(doc.ownerAddress)})`,
          eq(addressBook.chainId, Number(doc.chainId)),
          sql`LOWER(${addressBook.address}) = LOWER(${String(doc.address)})`
        )
      )
      .limit(1)
    if (existing.length > 0) {
      await db
        .update(addressBook)
        .set({
          label: String(doc.label),
          kind: (doc.kind as string) ?? 'wallet',
          isPublic: Boolean(doc.isPublic ?? false)
        })
        .where(eq(addressBook.id, existing[0].id))
    } else {
      await db.insert(addressBook).values({
        ownerAddress: String(doc.ownerAddress),
        chainId: Number(doc.chainId),
        address: String(doc.address),
        label: String(doc.label),
        kind: (doc.kind as string) ?? 'wallet',
        isPublic: Boolean(doc.isPublic ?? false)
      })
    }
    console.log('Address book upsert done')
    return res.status(200).json({ message: 'Address book upsert done' })
  }
)

const removeHandler = withVerifiedAs(
  (req) => (parseBody(req) as { ownerAddress?: string }).ownerAddress,
  async (req, res) => {
    const db = getDb()
    const doc = parseBody(req) as Record<string, unknown>
    if (!doc.ownerAddress || !doc.address || doc.chainId === undefined) {
      return res.status(400).json({ message: 'Missing address book fields' })
    }
    await db
      .delete(addressBook)
      .where(
        and(
          sql`LOWER(${addressBook.ownerAddress}) = LOWER(${String(doc.ownerAddress)})`,
          eq(addressBook.chainId, Number(doc.chainId)),
          sql`LOWER(${addressBook.address}) = LOWER(${String(doc.address)})`
        )
      )
    console.log('Address book removal done')
    return res.status(200).json({ message: 'Address book removal done' })
  }
)

const listHandler = withVerifiedAs(
  (req) => parseQueryString(req).ownerAddress,
  async (req, res) => {
    const db = getDb()
    const ownerAddress = parseQueryString(req).ownerAddress
    const rows = await db
      .select({
        id: addressBook.id,
        chainId: addressBook.chainId,
        address: addressBook.address,
        label: addressBook.label,
        kind: addressBook.kind,
        isPublic: addressBook.isPublic
      })
      .from(addressBook)
      .where(sql`LOWER(${addressBook.ownerAddress}) = LOWER(${ownerAddress})`)
    return res.status(200).json({
      message: 'Data retrieved',
      content: rows.map((row) => ({
        id: String(row.id),
        chainId: Number(row.chainId),
        address: String(row.address),
        label: String(row.label),
        kind: String(row.kind),
        isPublic: Boolean(row.isPublic)
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
