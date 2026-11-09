import { NextApiRequest, NextApiResponse } from 'next'

import { getVerifiedAddress } from '../../../lib/auth/siwe'
import { readBearerToken, resolveApiKey } from '../../../lib/auth/apiKey'

// Who the current credentials act as. Accepts any valid API key (whatever
// its scopes) or a SIWE session, so agents can check their setup before
// doing anything. Never reveals more than the key's own metadata.
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const token = readBearerToken(req)
  if (token != null) {
    const key = await resolveApiKey(token)
    if (key == null) return res.status(401).json({ message: 'Invalid, expired or revoked API key' })
    return res
      .status(200)
      .json({ address: key.address, via: 'apikey', scopes: key.scopes, walletAddresses: key.walletAllowlist })
  }
  const address = getVerifiedAddress(req)
  if (address == null) return res.status(200).json({ address: null, via: null, scopes: [] })
  return res
    .status(200)
    .json({ address, via: 'siwe', scopes: ['read', 'propose', 'sign', 'manage'], walletAddresses: [] })
}

export default handler
