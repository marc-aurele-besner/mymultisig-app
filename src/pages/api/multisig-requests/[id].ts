import { NextApiRequest, NextApiResponse } from 'next'

import { getSql } from '../../../lib/db/neon'
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
  const sql = getSql()
  const arr = (await sql`SELECT * FROM multisig_requests WHERE id = ${id}`) as Record<string, unknown>[]
  if (arr.length === 0) return res.status(404).json({ message: 'Data not found' })
  return res.status(200).json({
    message: 'Data retrieved',
    content: [rowToMultiSigRequest(arr[0])]
  })
}

const patchHandler = withSession(async (req, res) => {
  const id = parseIdParam(req)
  if (id == null) return res.status(400).json({ message: 'Missing request id' })
  const sql = getSql()
  const rows = (await sql`SELECT * FROM multisig_requests WHERE id = ${id}`) as Record<string, unknown>[]
  if (rows.length === 0) {
    return res.status(400).json({ message: 'Invalid document id' })
  }
  const existing = rows[0]
  const patch = parseBody(req) as Record<string, unknown>
  const request = patch.request ?? existing.request
  const signatures = patch.signatures ?? existing.signatures ?? []
  const ownerSigners = patch.ownerSigners ?? existing.owner_signers ?? []
  const dateExecuted = patch.dateExecuted ?? existing.date_executed ?? ''
  const isExecuted = patch.isExecuted ?? existing.is_executed ?? false
  const isSuccessful = patch.isSuccessful ?? patch.isSuccess ?? existing.is_successful ?? false
  const isActive = patch.isActive ?? existing.is_active ?? true
  const isCancelled = patch.isCancelled ?? existing.is_cancelled ?? false

  await sql`
    UPDATE multisig_requests SET
      request = ${JSON.stringify(request)},
      signatures = ${JSON.stringify(signatures)},
      owner_signers = ${JSON.stringify(ownerSigners)},
      date_executed = ${dateExecuted},
      is_executed = ${isExecuted},
      is_successful = ${isSuccessful},
      is_active = ${isActive},
      is_cancelled = ${isCancelled}
    WHERE id = ${id}
  `
  const updated = (await sql`SELECT * FROM multisig_requests WHERE id = ${id}`) as Record<string, unknown>[]
  return res.status(200).json({
    message: 'Data updated',
    content: rowToMultiSigRequest(updated[0])
  })
})

const deleteHandler = withSession(async (req, res) => {
  const id = parseIdParam(req)
  if (id == null) return res.status(400).json({ message: 'Missing request id' })
  const sql = getSql()
  await sql`DELETE FROM multisig_requests WHERE id = ${id}`
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
