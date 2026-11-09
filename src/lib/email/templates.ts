// Plain-data email templates. Each returns subject, text, and html so the
// Resend call can send a multipart message. Every value interpolated into
// HTML is escaped: request descriptions are user-authored.

export interface RenderedEmail {
  subject: string
  text: string
  html: string
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })

const shortAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`

const wrapHtml = (heading: string, bodyHtml: string, footerHtml: string): string =>
  `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;color:#111;">` +
  `<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;">` +
  `<h1 style="font-size:18px;margin:0 0 16px;">${escapeHtml(heading)}</h1>` +
  `${bodyHtml}` +
  `<p style="font-size:12px;color:#666;margin:24px 0 0;">${footerHtml}</p>` +
  `</div></body></html>`

const button = (label: string, url: string): string =>
  `<p style="margin:24px 0;"><a href="${escapeHtml(url)}" style="background:#e4572e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;display:inline-block;">${escapeHtml(label)}</a></p>`

export interface ConfirmSubscriptionInput {
  confirmUrl: string
}

// Sent when an owner adds or changes the inbox for their signer wallet.
// Mail is not delivered to the address until this link is clicked.
export const renderConfirmSubscription = ({ confirmUrl }: ConfirmSubscriptionInput): RenderedEmail => {
  const subject = 'Confirm your MyMultiSig email notifications'
  const text =
    'Confirm that you want MyMultiSig to email you when a request needs your signature or is ready to execute.\n\n' +
    `Confirm: ${confirmUrl}\n\n` +
    "If you didn't ask for this, you can ignore this email and nothing will be sent."
  const html = wrapHtml(
    'Confirm your email notifications',
    `<p style="font-size:14px;line-height:1.5;">Confirm that you want MyMultiSig to email you when a request needs your signature or is ready to execute.</p>` +
      button('Confirm email notifications', confirmUrl),
    "If you didn't ask for this, ignore this email and nothing will be sent."
  )
  return { subject, text, html }
}

export interface RequestEmailInput {
  kind: 'needs-signature' | 'threshold-reached'
  description: string
  submitter: string
  multiSigAddress: string
  multiSigName: string | null
  chainName: string | null
  signatureCount: number
  threshold: number
  requestUrl: string
  unsubscribeUrl: string
}

// One template for both lifecycle emails so the layout, links, and footer
// stay identical; only the heading and the call to action change.
export const renderRequestEmail = (input: RequestEmailInput): RenderedEmail => {
  const wallet = input.multiSigName?.trim() || shortAddress(input.multiSigAddress)
  const chain = input.chainName ?? 'your chain'
  const progress = `${input.signatureCount}/${input.threshold} signatures`
  const isReady = input.kind === 'threshold-reached'
  const heading = isReady ? 'Ready to execute' : 'Your signature is needed'
  const lead = isReady
    ? `A request on ${wallet} (${chain}) has reached its signing threshold and can be executed.`
    : `A request on ${wallet} (${chain}) is waiting for your signature.`
  const cta = isReady ? 'Open request to execute' : 'Open request to sign'
  const footer = `You're receiving this because your wallet is an owner of ${escapeHtml(wallet)}. <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#666;">Unsubscribe</a>`

  const subject = isReady ? `Ready to execute on ${wallet}` : `Signature needed on ${wallet}`
  const text =
    `${heading}\n\n${lead}\n\n` +
    `Description: ${input.description || '(none)'}\n` +
    `Submitted by: ${input.submitter}\n` +
    `Progress: ${progress}\n` +
    `Multisig: ${input.multiSigAddress}\n\n` +
    `${cta}: ${input.requestUrl}\n\n` +
    `Unsubscribe: ${input.unsubscribeUrl}`
  const html = wrapHtml(
    heading,
    `<p style="font-size:14px;line-height:1.5;">${escapeHtml(lead)}</p>` +
      `<table style="font-size:14px;line-height:1.6;border-collapse:collapse;">` +
      `<tr><td style="color:#666;padding-right:12px;">Description</td><td>${escapeHtml(input.description || '(none)')}</td></tr>` +
      `<tr><td style="color:#666;padding-right:12px;">Submitted by</td><td style="font-family:monospace;">${escapeHtml(input.submitter)}</td></tr>` +
      `<tr><td style="color:#666;padding-right:12px;">Progress</td><td>${escapeHtml(progress)}</td></tr>` +
      `<tr><td style="color:#666;padding-right:12px;">Multisig</td><td style="font-family:monospace;">${escapeHtml(input.multiSigAddress)}</td></tr>` +
      `</table>` +
      button(cta, input.requestUrl),
    footer
  )
  return { subject, text, html }
}
