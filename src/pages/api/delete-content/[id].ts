import { NextApiRequest, NextApiResponse } from 'next'

import { getSql } from '../../../lib/db/neon'
import { getVerifiedAddress } from '../../../lib/auth/siwe'

if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL in .env file')

const FUNCTION = 'delete-content'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(req.body)
  const { id } = req.query
  if (!id) throw new Error('No id in query')
  if (typeof id !== 'string') throw new Error('id is not a string')

  if (data.action !== undefined && data.data !== undefined) {
    const sql = getSql()

    if (getVerifiedAddress(req) == null) {
      return res.status(401).json({ message: 'Wallet not verified: sign in with your wallet first' })
    }

    switch (data.action) {
      case 'deleteMultiSigRequest': {
        // Use document id (UUID) from URL - client passes requestDetails.data.id
        await sql`DELETE FROM multisig_requests WHERE id = ${id}`
        return res.status(200).json({
          message: 'Data retrieved',
          content: 'Ref deleted'
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
