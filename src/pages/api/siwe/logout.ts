import { NextApiRequest, NextApiResponse } from 'next'

import { clearSession } from '../../../lib/auth/siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  clearSession(res)
  return res.status(200).json({ address: null })
}

export default handler
