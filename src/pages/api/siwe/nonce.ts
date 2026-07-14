import { NextApiRequest, NextApiResponse } from 'next'

import { issueNonce } from '../../../lib/auth/siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  const nonce = issueNonce(res)
  return res.status(200).json({ nonce })
}

export default handler
