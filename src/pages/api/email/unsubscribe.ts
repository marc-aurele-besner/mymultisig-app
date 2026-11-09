import { NextApiRequest, NextApiResponse } from 'next'

import { removeSubscriptionByToken } from '../../../lib/email/recipients'

// Target of the unsubscribe link in every notification email. Removes the
// inbox that the token belongs to and redirects to the settings page. A stale
// or unknown token is reported as invalid, not as an error.
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const token = typeof req.query.token === 'string' ? req.query.token : ''
  if (token.length === 0 || token.length > 200) {
    return res.redirect(302, '/settings/email?email=invalid')
  }
  const removed = await removeSubscriptionByToken(token)
  return res.redirect(302, removed ? '/settings/email?email=unsubscribed' : '/settings/email?email=invalid')
}

export default handler
