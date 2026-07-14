import { NextApiRequest, NextApiResponse } from 'next'

import { getVerifiedAddress } from '../../../lib/auth/siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  return res.status(200).json({ address: getVerifiedAddress(req) })
}

export default handler
