import { NextApiRequest, NextApiResponse } from 'next'

import { getSql } from '../../../../lib/db/neon'
import { rowToMultiSigRequest } from '../../../../lib/db/mappers'
import { parseIdParam, withSession } from '../../../../lib/api/middleware'

// POST /api/multisig-requests/[id]/reset
// Wipe the signature arrays on a stored request so it can be re-signed from
// scratch. Distinct from PATCH because the wire shape and intent are
// different; the empty arrays are server-known so the body is unused.
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const id = parseIdParam(req)
  if (id == null) return res.status(400).json({ message: 'Missing request id' })
  return withSession(async (sessionReq, sessionRes) => {
    const sql = getSql()
    const rows = (await sql`SELECT * FROM multisig_requests WHERE id = ${id}`) as Record<string, unknown>[]
    if (rows.length === 0) {
      return sessionRes.status(400).json({ message: 'Invalid document id' })
    }
    await sql`
      UPDATE multisig_requests SET
        signatures = ${JSON.stringify([])},
        owner_signers = ${JSON.stringify([])}
      WHERE id = ${id}
    `
    const updated = (await sql`SELECT * FROM multisig_requests WHERE id = ${id}`) as Record<string, unknown>[]
    return sessionRes.status(200).json({
      message: 'Data updated',
      content: rowToMultiSigRequest(updated[0])
    })
  })(req, res)
}

export default handler
