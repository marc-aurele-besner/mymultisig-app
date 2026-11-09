import { NextApiRequest, NextApiResponse } from 'next'

import { confirmUrl } from '../../../lib/email/links'
import {
  isWalletOwnerOfAnyMultiSig,
  findSubscriptionByWallet,
  removeSubscriptionForWallet,
  upsertSubscription
} from '../../../lib/email/recipients'
import { sendEmail } from '../../../lib/email/send'
import { renderConfirmSubscription } from '../../../lib/email/templates'
import { parseBody, withSession } from '../../../lib/api/middleware'

// The signed-in wallet's email notification inbox.
//   GET    current subscription + whether the wallet is an owner
//   PUT    set/replace the inbox (sends a confirmation link; mail is off until confirmed)
//   DELETE remove the inbox
// Every route needs a SIWE session. Only owners of at least one multisig may
// subscribe, so the endpoint cannot be used to mail arbitrary addresses.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254

const toPublicSubscription = (row: Awaited<ReturnType<typeof findSubscriptionByWallet>>) =>
  row == null ? null : { email: row.email, verified: row.verifiedAt != null }

const handler = withSession(async (req: NextApiRequest, res: NextApiResponse, address: string) => {
  if (req.method === 'GET') {
    const [isOwner, row] = await Promise.all([isWalletOwnerOfAnyMultiSig(address), findSubscriptionByWallet(address)])
    return res.status(200).json({
      message: 'Data retrieved',
      content: { isOwner, subscription: toPublicSubscription(row) }
    })
  }

  if (req.method === 'PUT') {
    const body = parseBody<{ email?: unknown }>(req)
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    if (email.length === 0 || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }
    if (!(await isWalletOwnerOfAnyMultiSig(address))) {
      return res.status(403).json({ message: 'Only an owner of a multisig can receive its notifications' })
    }

    const { row, needsConfirmation } = await upsertSubscription(address, email)
    if (needsConfirmation) {
      const sent = await sendEmail(row.email, renderConfirmSubscription({ confirmUrl: confirmUrl(row.linkToken) }))
      if (!sent) {
        return res.status(502).json({
          message: 'We could not send the confirmation email. Try again in a moment.'
        })
      }
    }
    return res.status(200).json({
      message: needsConfirmation ? 'Confirmation email sent' : 'Data updated',
      content: toPublicSubscription(row)
    })
  }

  if (req.method === 'DELETE') {
    await removeSubscriptionForWallet(address)
    return res.status(200).json({ message: 'Data deleted', content: { subscription: null } })
  }

  res.setHeader('Allow', 'GET, PUT, DELETE')
  return res.status(405).json({ message: 'Method not allowed' })
})

export default handler
