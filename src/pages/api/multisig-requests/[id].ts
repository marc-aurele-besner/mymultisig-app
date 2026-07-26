import { eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { multisigRequests, multisigWallets } from '../../../lib/db/schema'
import { rowToMultiSigRequest } from '../../../lib/db/mappers'
import { cascadeInvalidate } from '../../../lib/api/cascade'
import { parseBody, parseIdParam, withSession, withVerifiedAsOwner } from '../../../lib/api/middleware'

// Per-request endpoints under /api/multisig-requests/[id]:
//   GET    getMultiSigRequestById     (public read; returns {content: [row]})
//   PATCH  updateMultiSigRequest     (session required)
//   DELETE deleteMultiSigRequest     (session required)
//
// `getMultiSigRequestById` is public so the detail view can render before
// sign-in; mutations still go through `withSession`. Each handler pulls the
// captured id from req.query so the wrappers stay uniform with the rest of
// the API.

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseIdParam(req)
  if (id == null) return res.status(400).json({ message: 'Missing request id' })
  const db = getDb()
  const rows = await db.select().from(multisigRequests).where(eq(multisigRequests.id, id)).limit(1)
  if (rows.length === 0) return res.status(404).json({ message: 'Data not found' })
  return res.status(200).json({
    message: 'Data retrieved',
    content: [rowToMultiSigRequest(rows[0])]
  })
}

const patchHandler = withVerifiedAsOwner(parseIdParam, async (req, res, _address, id) => {
  const db = getDb()
  const existingRows = await db.select().from(multisigRequests).where(eq(multisigRequests.id, id)).limit(1)
  if (existingRows.length === 0) {
    return res.status(404).json({ message: 'Data not found' })
  }
  const existing = existingRows[0]
  const patch = parseBody(req) as Record<string, unknown>

  // State-machine guards. Once a request is cancelled or executed, those
  // flags are terminal — letting callers flip them off lets a stale
  // (cached) client resurrect a row the rest of the system considers
  // closed. 409 matches the convention used by /cancel on executed rows.
  const nextExecuted = (patch.isExecuted as boolean) ?? existing.isExecuted
  const nextCancelled = (patch.isCancelled as boolean) ?? existing.isCancelled
  const nextSuccessful =
    (patch.isSuccessful as boolean) ?? (patch.isSuccess as boolean) ?? existing.isSuccessful
  if (existing.isCancelled && patch.isCancelled === false) {
    return res.status(409).json({ message: 'Cannot un-cancel a cancelled request' })
  }
  if (existing.isExecuted && patch.isExecuted === false) {
    return res.status(409).json({ message: 'Cannot un-execute an executed request' })
  }
  if (existing.isSuccessful && patch.isSuccessful === false) {
    return res.status(409).json({ message: 'Cannot un-success a successful request' })
  }
  // Successful → failed would un-success too; caught above when existing is
  // already successful. Failed → successful is a legitimate correction so
  // we don't block it.

  await db
    .update(multisigRequests)
    .set({
      request: (patch.request as Record<string, unknown>) ?? (existing.request as Record<string, unknown>),
      signatures: (patch.signatures as string[]) ?? existing.signatures ?? [],
      ownerSigners: (patch.ownerSigners as string[]) ?? existing.ownerSigners ?? [],
      dateExecuted: (patch.dateExecuted as string) ?? existing.dateExecuted ?? '',
      isExecuted: nextExecuted,
      isSuccessful: nextSuccessful,
      isActive: (patch.isActive as boolean) ?? existing.isActive ?? true,
      isCancelled: nextCancelled
    })
    .where(eq(multisigRequests.id, id))

  // Server-side cascade invalidation. The client previously ran the
  // Zustand-only cancelStaleRequests; now we mirror the invalidation
  // server-side so other clients pick it up on their next refresh.
  // Triggers:
  //   - isExecuted flipped false→true: success or fail depending on
  //     isSuccessful. cancelledBy stays '' for the source row (it's the
  //     actor, not the recipient of a cascade).
  //   - signatures dropped to [] while existing had any: a reset
  //     carried through PATCH (the dedicated /reset endpoint also runs
  //     cascade; this catches PATCH-based resets too).
  let cascade: { cancelledIds: string[] } = { cancelledIds: [] }
  const execFlipped = nextExecuted && !existing.isExecuted
  const signaturesReset =
    Array.isArray(patch.signatures) &&
    (patch.signatures as unknown[]).length === 0 &&
    existing.signatures.length > 0
  if (execFlipped || signaturesReset) {
    const walletRows = await db
      .select({ nonce: multisigWallets.nonce })
      .from(multisigWallets)
      .leftJoin(
        multisigRequests,
        sql`LOWER(${multisigWallets.address}) = LOWER(${multisigRequests.multiSigAddress})`
      )
      .where(eq(multisigRequests.id, id))
      .limit(1)
    cascade = await cascadeInvalidate(
      {
        id: existing.id,
        multiSigAddress: existing.multiSigAddress,
        txnNonce: existing.txnNonce ?? null
      },
      execFlipped ? (nextSuccessful ? 'executed' : 'failed') : 'reset',
      walletRows[0]?.nonce ?? null
    )
  }

  const updated = await db.select().from(multisigRequests).where(eq(multisigRequests.id, id)).limit(1)
  return res.status(200).json({
    message: 'Data updated',
    content: rowToMultiSigRequest(updated[0]),
    cascade
  })
})

const deleteHandler = withVerifiedAsOwner(parseIdParam, async (_req, res, _address, id) => {
  // Delete does NOT cascade — it is the explicit "gone" verb and wipes the
  // row from Neon. The owner check is enough.
  const db = getDb()
  await db.delete(multisigRequests).where(eq(multisigRequests.id, id))
  return res.status(200).json({
    message: 'Data deleted',
    content: 'Ref deleted'
  })
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') return getHandler(req, res)
  if (req.method === 'PATCH') return patchHandler(req, res)
  if (req.method === 'DELETE') return deleteHandler(req, res)
  res.setHeader('Allow', 'GET, PATCH, DELETE')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
