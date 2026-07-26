import { eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../../lib/db/neon'
import { multisigRequests, multisigWallets } from '../../../../lib/db/schema'
import { cascadeInvalidate } from '../../../../lib/api/cascade'
import { parseBody, parseIdParam, withSession } from '../../../../lib/api/middleware'

// POST /api/multisig-requests/[id]/cascade
// Internal fan-out entrypoint. A client that knows about an executed /
// reset / cancelled request can ask the server to invalidate every other
// active request bound to a higher effective nonce. Used so other clients
// converge after one peer triggered the change.
//
// Session-only (not owner-gated): the cascade targets *other* requests in
// the wallet, not the source. The source's id is verified to exist so a
// caller can't probe arbitrary ids without at least a valid session.

const cascadeHandler = withSession(async (req, res) => {
  const id = parseIdParam(req)
  if (id == null) return res.status(400).json({ message: 'Missing request id' })
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
  const source = rows[0].request

  const body = parseBody(req) as { trigger?: string }
  // We don't gate the trigger strictly — the helper writes 'cascade' for
  // every row it touches, so the caller's claim is informational. Accept
  // any of the four known values; default to 'executed' for safety.
  const allowed = ['executed', 'failed', 'reset', 'cancelled'] as const
  const trigger = (allowed.find((t) => t === body.trigger) ?? 'executed') as
    | 'executed'
    | 'failed'
    | 'reset'
    | 'cancelled'

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