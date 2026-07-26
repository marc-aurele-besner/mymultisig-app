import { eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../../lib/db/neon'
import { multisigRequests, multisigWallets } from '../../../../lib/db/schema'
import { rowToMultiSigRequest } from '../../../../lib/db/mappers'
import { cascadeInvalidate } from '../../../../lib/api/cascade'
import { parseBody, parseIdParam, withVerifiedAsOwner } from '../../../../lib/api/middleware'

// POST /api/multisig-requests/[id]/cancel
// Owner-initiated cancel. Distinct from reset (which only wipes signatures)
// and delete (which hard-removes). Marks the row isActive=false /
// isCancelled=true, sets dateCancelled + cancelledBy, and runs the cascade
// against the wallet's other active requests so they re-confirm.
//
// Idempotent: a second call on an already-cancelled row returns 200 with
// the existing row (no double-cascade, no timestamp bump).
//
// Body (all optional):
//   { cancelledBy?: 'owner' | 'cascade' }
// Defaults to 'owner'. The wrapper refuses non-owner wallets.

const cancelHandler = withVerifiedAsOwner(parseIdParam, async (req, res, _address, id) => {
  const db = getDb()
  const rows = await db
    .select({
      request: multisigRequests,
      nonce: multisigWallets.nonce
    })
    .from(multisigRequests)
    .leftJoin(
      multisigWallets,
      sql`LOWER(${multisigWallets.address}) = LOWER(${multisigRequests.multiSigAddress})`
    )
    .where(eq(multisigRequests.id, id))
    .limit(1)
  if (rows.length === 0) return res.status(404).json({ message: 'Data not found' })
  const existing = rows[0].request

  // Already cancelled: idempotent return. Don't re-run the cascade.
  if (existing.isCancelled) {
    return res.status(200).json({
      message: 'Request already cancelled',
      content: rowToMultiSigRequest(existing),
      cascade: { cancelledIds: [] }
    })
  }

  // Already executed: refuse — executed requests can only be reset or
  // deleted, not cancelled.
  if (existing.isExecuted) {
    return res.status(409).json({ message: 'Cannot cancel an executed request' })
  }

  const body = parseBody(req) as { cancelledBy?: string }
  const cancelledBy = body.cancelledBy === 'cascade' ? 'cascade' : 'owner'

  await db
    .update(multisigRequests)
    .set({
      isActive: false,
      isCancelled: true,
      dateCancelled: new Date().toISOString(),
      cancelledBy
    })
    .where(eq(multisigRequests.id, id))

  const cascade = await cascadeInvalidate(
    {
      id: existing.id,
      multiSigAddress: existing.multiSigAddress,
      txnNonce: existing.txnNonce ?? null
    },
    'cancelled',
    rows[0].nonce
  )

  const updated = await db.select().from(multisigRequests).where(eq(multisigRequests.id, id)).limit(1)
  return res.status(200).json({
    message: 'Request cancelled',
    content: rowToMultiSigRequest(updated[0]),
    cascade
  })
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  return cancelHandler(req, res)
}

export default handler