import { Resend } from 'resend'

import type { RenderedEmail } from './templates'

// Same default sender as the contact form (src/pages/api/contact.ts). Set
// RESEND_FROM to an address on a domain verified in Resend for production:
// the onboarding sender only delivers to the Resend account owner.
const DEFAULT_FROM = 'MyMultiSig <onboarding@resend.dev>'

// Sends one rendered email through Resend. Resolves to false instead of
// throwing so callers can keep fanning out and decide how to report it.
// The recipient address is never logged.
export const sendEmail = async (to: string, email: RenderedEmail): Promise<boolean> => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('sendEmail: RESEND_API_KEY is not set; skipping email')
    return false
  }
  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? DEFAULT_FROM,
      to,
      subject: email.subject,
      text: email.text,
      html: email.html
    })
    if (error) {
      console.error('sendEmail: Resend returned an error', error.name)
      return false
    }
    return true
  } catch (e) {
    console.error('sendEmail: Resend request failed', (e as Error).message)
    return false
  }
}
