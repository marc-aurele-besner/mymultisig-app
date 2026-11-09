import { NextApiRequest, NextApiResponse } from 'next'

import { confirmSubscription } from '../../../lib/email/recipients'

// Target of the confirm link in the double opt-in email. GET so it works from
// a plain click. Always redirects back to the settings page with a status so
// the UI can explain the outcome; the token itself is never echoed back.
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const token = typeof req.query.token === 'string' ? req.query.token : ''
  if (token.length === 0 || token.length > 200) {
    return res.redirect(302, '/settings/email?email=invalid')
  }
  const row = await confirmSubscription(token)
  if (row == null) {
    return res.redirect(302, '/settings/email?email=invalid')
  }
  return res.redirect(302, '/settings/email?email=confirmed')
}

export default handler
