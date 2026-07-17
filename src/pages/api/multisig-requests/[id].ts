import { eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../../../lib/db/neon'
import { multisigRequests } from '../../../lib/db/schema'
import { rowToMultiSigRequest } from '../../../lib/db/mappers'
import { parseBody, parseIdParam, withSession } from '../../../lib/api/middleware'

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

const patchHandler = withSession(async (req, res) => {
  const id = parseIdParam(req)
  if (id == null) return res.status(400).json({ message: 'Missing request id' })
  const db = getDb()
  const existingRows = await db.select().from(multisigRequests).where(eq(multisigRequests.id, id)).limit(1)
  if (existingRows.length === 0) {
    return res.status(400).json({ message: 'Invalid document id' })
  }
  const existing = existingRows[0]
  const patch = parseBody(req) as Record<string, unknown>

  await db
    .update(multisigRequests)
    .set({
      request: (patch.request as Record<string, unknown>) ?? (existing.request as Record<string, unknown>),
      signatures: (patch.signatures as string[]) ?? existing.signatures ?? [],
      ownerSigners: (patch.ownerSigners as string[]) ?? existing.ownerSigners ?? [],
      dateExecuted: (patch.dateExecuted as string) ?? existing.dateExecuted ?? '',
      isExecuted: (patch.isExecuted as boolean) ?? existing.isExecuted ?? false,
      isSuccessful:
        (patch.isSuccessful as boolean) ?? (patch.isSuccess as boolean) ?? existing.isSuccessful ?? false,
      isActive: (patch.isActive as boolean) ?? existing.isActive ?? true,
      isCancelled: (patch.isCancelled as boolean) ?? existing.isCancelled ?? false
    })
    .where(eq(multisigRequests.id, id))

  const updated = await db.select().from(multisigRequests).where(eq(multisigRequests.id, id)).limit(1)
  return res.status(200).json({
    message: 'Data updated',
    content: rowToMultiSigRequest(updated[0])
  })
})

const deleteHandler = withSession(async (req, res) => {
  const id = parseIdParam(req)
  if (id == null) return res.status(400).json({ message: 'Missing request id' })
  const db = getDb()
  await db.delete(multisigRequests).where(eq(multisigRequests.id, id))
  return res.status(200).json({
    message: 'Data retrieved',
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
