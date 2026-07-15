import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'

// Server side of the SIWE session: HMAC-signed HttpOnly cookies, no DB state.
// The user proves wallet ownership once per session by signing an EIP-4361
// message; API routes then trust the cookie instead of client-claimed fields.

const SESSION_COOKIE = 'siwe-session'
const NONCE_COOKIE = 'siwe-nonce'
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60
export const NONCE_TTL_SECONDS = 10 * 60

const secret = (): string => {
  const value = process.env.SESSION_SECRET ?? process.env.PRIVATE_KEY
  if (!value) throw new Error('SESSION_SECRET (or PRIVATE_KEY fallback) must be set for SIWE sessions')
  return value
}

const hmac = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url')

const sign = (payload: string) => `${Buffer.from(payload).toString('base64url')}.${hmac(payload)}`

const unsign = (token: string): string | null => {
  const [encoded, mac] = token.split('.')
  if (!encoded || !mac) return null
  const payload = Buffer.from(encoded, 'base64url').toString()
  const expected = hmac(payload)
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return payload
}

const serializeCookie = (name: string, value: string, maxAgeSeconds: number) => {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : [])
  ]
  return parts.join('; ')
}

const appendCookie = (res: NextApiResponse, cookie: string) => {
  const existing = res.getHeader('Set-Cookie')
  const cookies = existing == null ? [] : Array.isArray(existing) ? existing.map(String) : [String(existing)]
  res.setHeader('Set-Cookie', [...cookies, cookie])
}

export const issueNonce = (res: NextApiResponse): string => {
  const nonce = randomBytes(16).toString('hex')
  const payload = JSON.stringify({ nonce, exp: Math.floor(Date.now() / 1000) + NONCE_TTL_SECONDS })
  appendCookie(res, serializeCookie(NONCE_COOKIE, sign(payload), NONCE_TTL_SECONDS))
  return nonce
}

export const readNonce = (req: NextApiRequest): string | null => {
  const token = req.cookies[NONCE_COOKIE]
  if (!token) return null
  const payload = unsign(token)
  if (!payload) return null
  try {
    const { nonce, exp } = JSON.parse(payload)
    if (typeof exp !== 'number' || exp < Math.floor(Date.now() / 1000)) return null
    return typeof nonce === 'string' ? nonce : null
  } catch {
    return null
  }
}

export const setSession = (res: NextApiResponse, address: string) => {
  const payload = JSON.stringify({
    address: address.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  })
  appendCookie(res, serializeCookie(SESSION_COOKIE, sign(payload), SESSION_TTL_SECONDS))
  // The nonce is single-use: consume it with the session grant.
  appendCookie(res, serializeCookie(NONCE_COOKIE, '', 0))
}

export const clearSession = (res: NextApiResponse) => {
  appendCookie(res, serializeCookie(SESSION_COOKIE, '', 0))
}

// The SIWE-verified wallet address for this request, or null when the caller
// has no (valid, unexpired) session.
export const getVerifiedAddress = (req: NextApiRequest): string | null => {
  const token = req.cookies[SESSION_COOKIE]
  if (!token) return null
  const payload = unsign(token)
  if (!payload) return null
  try {
    const { address, exp } = JSON.parse(payload)
    if (typeof exp !== 'number' || exp < Math.floor(Date.now() / 1000)) return null
    return typeof address === 'string' ? address : null
  } catch {
    return null
  }
}

// True when the session wallet matches the address a payload claims to act as.
export const isVerifiedAs = (req: NextApiRequest, claimed: string | undefined | null): boolean => {
  if (claimed == null) return false
  const verified = getVerifiedAddress(req)
  return verified != null && verified === String(claimed).toLowerCase()
}

// MyMultiSig admin wallets, from the ADMIN_ADDRESSES env var (comma-separated).
// Admins can read publicly shared address book entries to decide which
// contracts to support officially.
const adminAddresses = (process.env.ADMIN_ADDRESSES ?? '')
  .split(',')
  .map((address) => address.trim().toLowerCase())
  .filter((address) => address !== '')

export const isVerifiedAdmin = (req: NextApiRequest): boolean => {
  const verified = getVerifiedAddress(req)
  return verified != null && adminAddresses.includes(verified)
}
