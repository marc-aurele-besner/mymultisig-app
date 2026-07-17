import { desc, eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { addressBook } from '../../../lib/db/schema'
import { isVerifiedAdmin } from '../../../lib/auth/siwe'
import { withSession } from '../../../lib/api/middleware'

// GET /api/admin/public-address-book
// Every publicly shared address-book entry across all owners + chains. Used by
// MyMultiSig admins on /admin to see which contracts the community relies on.
// Behaviour shift from the legacy dispatch: an unauthenticated request
// returns 401 (no SIWE session) instead of 403; a signed-in non-admin still
// gets 403 — both via the explicit guards below.
const handler = withSession(async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  if (!isVerifiedAdmin(req)) {
    return res.status(403).json({ message: 'Only MyMultiSig admins can view the public address book' })
  }
  const db = getDb()
  const rows = await db
    .select({
      id: addressBook.id,
      ownerAddress: addressBook.ownerAddress,
      chainId: addressBook.chainId,
      address: addressBook.address,
      label: addressBook.label,
      kind: addressBook.kind
    })
    .from(addressBook)
    .where(eq(addressBook.isPublic, true))
    .orderBy(desc(addressBook.createdAt))
  return res.status(200).json({
    message: 'Data retrieved',
    content: rows.map((row) => ({
      id: String(row.id),
      ownerAddress: String(row.ownerAddress),
      chainId: Number(row.chainId),
      address: String(row.address),
      label: String(row.label),
      kind: String(row.kind)
    }))
  })
})

export default handler
