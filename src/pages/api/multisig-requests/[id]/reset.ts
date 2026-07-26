import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../../lib/db/neon'
import { multisigRequests } from '../../../../lib/db/schema'
import { rowToMultiSigRequest } from '../../../../lib/db/mappers'
import { parseIdParam, withVerifiedAsOwner } from '../../../../lib/api/middleware'

// POST /api/multisig-requests/[id]/reset
// Wipe the signature arrays on a stored request so it can be re-signed from
// scratch. Distinct from PATCH because the wire shape and intent are
// different; the empty arrays are server-known so the body is unused.
//
// Owner-gated (withVerifiedAsOwner) so a signed-in non-owner wallet can't
// wipe another team's progress.
const resetHandler = withVerifiedAsOwner(parseIdParam, async (_req, res, _address, id) => {
  const db = getDb()
  const rows = await db.select().from(multisigRequests).where(eq(multisigRequests.id, id)).limit(1)
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Data not found' })
  }
  await db
    .update(multisigRequests)
    .set({ signatures: [], ownerSigners: [] })
    .where(eq(multisigRequests.id, id))
  const updated = await db.select().from(multisigRequests).where(eq(multisigRequests.id, id)).limit(1)
  return res.status(200).json({
    message: 'Data updated',
    content: rowToMultiSigRequest(updated[0])
  })
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  return resetHandler(req, res)
}

export default handler
