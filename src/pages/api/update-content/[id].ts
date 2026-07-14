import { NextApiRequest, NextApiResponse } from 'next'

import { getSql } from '../../../lib/db/neon'
import { rowToMultiSigRequest } from '../../../lib/db/mappers'
import { getVerifiedAddress } from '../../../lib/auth/siwe'

if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL in .env file')

const FUNCTION = 'update-content'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(req.body)
  const { id } = req.query
  if (!id) throw new Error('No id in query')
  if (typeof id !== 'string') throw new Error('id is not a string')

  if (data.action !== undefined && data.data !== undefined) {
    const sql = getSql()

    // Request patches carry EIP-712 owner signatures that the contract
    // re-verifies at execution; here we only require a verified wallet session.
    if (getVerifiedAddress(req) == null) {
      return res.status(401).json({ message: 'Wallet not verified: sign in with your wallet first' })
    }

    switch (data.action) {
      case 'updateMultiSigRequest':
      case 'resetMultiSigRequest': {
        const rows = (await sql`
          SELECT * FROM multisig_requests WHERE id = ${id}
        `) as Record<string, unknown>[]
        if (rows.length === 0) {
          return res.status(400).json({ message: 'Invalid document id' })
        }
        const existing = rows[0]
        const patch = data.data as Record<string, unknown>
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
        const updated = (await sql`
          SELECT * FROM multisig_requests WHERE id = ${id}
        `) as Record<string, unknown>[]
        return res.status(200).json({
          message: 'Data updated',
          content: rowToMultiSigRequest(updated[0])
        })
      }
      default:
        return res.status(400).json({ message: 'Invalid collection' })
    }
  } else {
    console.log('Invalid data')
    return res.status(400).json({
      message: 'Invalid data'
    })
  }
}

export default handler
