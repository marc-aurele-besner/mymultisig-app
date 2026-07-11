import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const FUNCTION = 'contact'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME_LENGTH = 100
const MAX_MESSAGE_LENGTH = 5000

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.info('Function `%s` invoked', FUNCTION)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, message, company } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

  // Honeypot field: real users never fill it, bots do. Pretend success.
  if (company) return res.status(200).json({ ok: true })

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address so we can reply.' })
  }
  if (typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ error: 'Message needs at least 10 characters.' })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message is limited to ${MAX_MESSAGE_LENGTH} characters.` })
  }
  if (name !== undefined && (typeof name !== 'string' || name.length > MAX_NAME_LENGTH)) {
    return res.status(400).json({ error: `Name is limited to ${MAX_NAME_LENGTH} characters.` })
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_CONTACT_TO) {
    console.error('Function `%s` missing RESEND_API_KEY or RESEND_CONTACT_TO', FUNCTION)
    return res.status(500).json({ error: 'The contact form is not configured on this deployment.' })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'MyMultiSig <onboarding@resend.dev>',
      to: process.env.RESEND_CONTACT_TO,
      replyTo: email,
      subject: `MyMultiSig contact — ${name?.trim() || email}`,
      text: `From: ${name?.trim() || 'Not given'} <${email}>\n\n${message.trim()}`
    })
    if (error) {
      console.error('Function `%s` Resend error:', FUNCTION, error)
      return res.status(502).json({ error: 'Your message could not be sent. Try again in a moment.' })
    }
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Function `%s` error:', FUNCTION, error)
    return res.status(502).json({ error: 'Your message could not be sent. Try again in a moment.' })
  }
}

export default handler
