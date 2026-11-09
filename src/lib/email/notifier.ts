import { listVerifiedForOwners, pickRecipients } from './recipients'
import { requestUrl, unsubscribeUrl } from './links'
import { sendEmail } from './send'
import { renderRequestEmail } from './templates'
import type { RequestEmailInput } from './templates'

// Email fan-out for multisig request lifecycle events. Two triggers:
//   - needs-signature: a request was created; every verified owner who has
//     not signed yet is told it is waiting on them.
//   - threshold-reached: a signature pushed the count to the wallet threshold;
//     every verified owner is told it can be executed.
// Like the chat dispatcher, callers fire this with `void … .catch(...)` so a
// mail failure never blocks the API response.

export interface EmailWalletContext {
  multiSigAddress: string
  multiSigName: string | null
  chainName: string | null
  owners: string[]
  threshold: number
}

export interface EmailRequestContext {
  requestId: string
  description: string
  submitter: string
  signatureCount: number
  // Owners who have already signed; they are not asked to sign again.
  ownerSigners: string[]
}

const fanOut = async (
  wallet: EmailWalletContext,
  request: EmailRequestContext,
  kind: RequestEmailInput['kind'],
  excludeSigners: string[]
): Promise<void> => {
  if (wallet.owners.length === 0) return
  const rows = await listVerifiedForOwners(wallet.owners)
  const recipients = pickRecipients(rows, wallet.owners, excludeSigners)
  if (recipients.length === 0) return

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendEmail(
        recipient.email,
        renderRequestEmail({
          kind,
          description: request.description,
          submitter: request.submitter,
          multiSigAddress: wallet.multiSigAddress,
          multiSigName: wallet.multiSigName,
          chainName: wallet.chainName,
          signatureCount: request.signatureCount,
          threshold: wallet.threshold,
          requestUrl: requestUrl(request.requestId),
          unsubscribeUrl: unsubscribeUrl(recipient.linkToken)
        })
      )
    )
  )
  const failed = results.filter((r) => r.status === 'rejected' || r.value === false).length
  if (failed > 0) {
    console.error(`email ${kind}: ${failed}/${recipients.length} sends failed for ${wallet.multiSigAddress}`)
  }
}

export const notifyNeedsSignature = (wallet: EmailWalletContext, request: EmailRequestContext): Promise<void> =>
  fanOut(wallet, request, 'needs-signature', [...request.ownerSigners, request.submitter])

export const notifyThresholdReached = (wallet: EmailWalletContext, request: EmailRequestContext): Promise<void> =>
  fanOut(wallet, request, 'threshold-reached', [])
