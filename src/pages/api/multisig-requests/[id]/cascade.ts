import { eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../../lib/db/neon'
import { multisigRequests, multisigWallets } from '../../../../lib/db/schema'
import { cascadeInvalidate, triggerFromState } from '../../../../lib/api/cascade'
import { parseIdParam, withVerifiedAsOwner } from '../../../../lib/api/middleware'

// POST /api/multisig-requests/[id]/cascade
// Re-runs the cascade for a request that was already executed, cancelled or
// reset, so other clients converge after one peer triggered the change.
//
// Owner-only, and the trigger is derived from the source request's stored
// state rather than taken from the caller: an execution cascade cancels
// every other request in the wallet, so it must only run for a request that
// really was executed. A live request (still holding signatures) has
// nothing to cascade and gets 409.

const cascadeHandler = withVerifiedAsOwner(parseIdParam, async (_req, res, _address, id) => {
  const db = getDb()
  const rows = await db
    .select({
      request: multisigRequests,
      nonce: multisigWallets.nonce
    })
    .from(multisigRequests)
    .leftJoin(multisigWallets, sql`LOWER(${multisigWallets.address}) = LOWER(${multisigRequests.multiSigAddress})`)
    .where(eq(multisigRequests.id, id))
    .limit(1)
  if (rows.length === 0) return res.status(404).json({ message: 'Data not found' })
  const source = rows[0].request

  const trigger = triggerFromState(source)
  if (trigger == null)
    return res.status(409).json({ message: 'Nothing to cascade: the request is still live with its signatures' })

  const cascade = await cascadeInvalidate(
    {
      id: source.id,
      multiSigAddress: source.multiSigAddress,
      txnNonce: source.txnNonce ?? null
    },
    trigger,
    rows[0].nonce
  )

  return res.status(200).json({
    message: 'Cascade complete',
    trigger,
    cascade
  })
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  return cascadeHandler(req, res)
}

export default handler
