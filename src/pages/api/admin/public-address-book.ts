import { NextApiRequest, NextApiResponse } from 'next'

import { getSql } from '../../../lib/db/neon'
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
  const sql = getSql()
  const rows = (await sql`
    SELECT id, owner_address, chain_id, address, label, kind FROM address_book
    WHERE is_public = true
    ORDER BY created_at DESC
  `) as Record<string, unknown>[]
  return res.status(200).json({
    message: 'Data retrieved',
    content: rows.map((row) => ({
      id: String(row.id),
      ownerAddress: String(row.owner_address),
      chainId: Number(row.chain_id),
      address: String(row.address),
      label: String(row.label),
      kind: String(row.kind)
    }))
  })
})

export default handler
