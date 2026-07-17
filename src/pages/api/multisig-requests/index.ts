import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuid } from 'uuid'

import { getSql } from '../../../lib/db/neon'
import { rowToMultiSigRequest } from '../../../lib/db/mappers'
import { parseBody, withSession, withVerifiedAs } from '../../../lib/api/middleware'

// Dedicated endpoints for multisig transaction requests:
//   POST /api/multisig-requests         addMultiSigRequest
//   GET  /api/multisig-requests?…       getMultiSigRequests   (public read)
//
// `addMultiSigRequest` requires the SIWE session to match the body-claimed
// `submitter`. The 403 for `allow_only_owner_request` (extended wallets that
// only accept requests from their owners) lives inside the handler because it
// needs a fresh wallet row.
const createHandler = withVerifiedAs(
  (req) => (parseBody(req) as { submitter?: string }).submitter,
  async (req, res) => {
    const sql = getSql()
    const body = parseBody(req) as Record<string, unknown>
    const doc = { id: uuid(), ...body }

    const wallets = (await sql`
      SELECT owners, allow_only_owner_request FROM multisig_wallets
      WHERE LOWER(address) = LOWER(${doc.multiSigAddress})
      ORDER BY id DESC LIMIT 1
    `) as { owners: string[]; allow_only_owner_request: boolean }[]
    if (wallets.length > 0 && wallets[0].allow_only_owner_request) {
      const owners = (wallets[0].owners ?? []).map((o: string) => o.toLowerCase())
      if (owners.length > 0 && !owners.includes(String(doc.submitter ?? '').toLowerCase())) {
        return res.status(403).json({ message: 'This wallet only accepts requests from its owners' })
      }
    }

    await sql`
      INSERT INTO multisig_requests (
        id, multi_sig_address, request, description, submitter,
        signatures, owner_signers, date_submitted, date_executed,
        is_active, is_executed, is_cancelled, is_confirmed, is_successful
      ) VALUES (
        ${doc.id},
        ${doc.multiSigAddress},
        ${JSON.stringify(doc.request)},
        ${doc.description},
        ${doc.submitter},
        ${JSON.stringify(doc.signatures ?? [])},
        ${JSON.stringify(doc.ownerSigners ?? [])},
        ${doc.dateSubmitted},
        ${doc.dateExecuted ?? ''},
        ${doc.isActive ?? true},
        ${doc.isExecuted ?? false},
        ${doc.isCancelled ?? false},
        ${doc.isConfirmed ?? false},
        ${doc.isSuccessful ?? false}
      )
    `
    console.log('Add request done')
    return res.status(200).json({ message: 'Add request done' })
  }
)

const listHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const multiSigAddress = typeof req.query.multiSigAddress === 'string' ? req.query.multiSigAddress : ''
  if (multiSigAddress === '') {
    return res.status(400).json({ message: 'Missing multiSigAddress' })
  }
  const sql = getSql()
  const rows = (await sql`
    SELECT * FROM multisig_requests
    WHERE multi_sig_address = ${multiSigAddress}
      AND is_active = true
  `) as Record<string, unknown>[]
  return res.status(200).json({
    message: 'Data retrieved',
    content: rows.map(rowToMultiSigRequest)
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') return listHandler(req, res)
  if (req.method === 'POST') return createHandler(req, res)
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ message: 'Method not allowed' })
}

export default handler
