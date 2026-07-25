import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

import type { NextApiRequest, NextApiResponse } from 'next'

// Signed-cookie helpers for the OAuth state parameter. Discord does not
// implement CSRF protection for the OAuth flow (per
// https://discord.com/developers/docs/topics/oauth2#state), so this
// signed cookie is the only line of defense: the install handler mints a
// state + exp + returnTo, the callback handler verifies the cookie, and
// nothing else on the server trusts the state string.
//
// The HMAC pattern mirrors src/lib/auth/siwe.ts:13-32 and
// src/lib/slack/state.ts so any future reader already knows the shape.
// We sign with the same SESSION_SECRET (or its PRIVATE_KEY fallback) — a
// leaked secret compromises all three cookies, which is fine because all
// three protect the same identity.

const STATE_COOKIE = 'discord-oauth-state'
export const STATE_TTL_SECONDS = 10 * 60

export interface DiscordStatePayload {
  // The `state` value sent to Discord's authorize URL; the cookie binds to it.
  state: string
  // Epoch seconds when the cookie expires.
  exp: number
  // Optional return path on the app side (e.g. /settings/discord?installed=1).
  returnTo?: string
  // Optional Discord guild hint (the user clicked "Add to Discord" from a
  // specific guild landing page).
  guildHint?: string
}

const secret = (): string => {
  const value = process.env.SESSION_SECRET ?? process.env.PRIVATE_KEY
  if (!value) throw new Error('SESSION_SECRET (or PRIVATE_KEY fallback) must be set for OAuth state')
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

export const issueState = (res: NextApiResponse, extra: { returnTo?: string; guildHint?: string } = {}): string => {
  const state = randomBytes(16).toString('hex')
  const payload: DiscordStatePayload = {
    state,
    exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS,
    ...(extra.returnTo !== undefined ? { returnTo: extra.returnTo } : {}),
    ...(extra.guildHint !== undefined ? { guildHint: extra.guildHint } : {})
  }
  appendCookie(res, serializeCookie(STATE_COOKIE, sign(JSON.stringify(payload)), STATE_TTL_SECONDS))
  return state
}

export const consumeState = (
  req: NextApiRequest,
  res: NextApiResponse,
  incomingState: string
): DiscordStatePayload | null => {
  const token = req.cookies[STATE_COOKIE]
  // Always clear the cookie on consume (single-use).
  appendCookie(res, serializeCookie(STATE_COOKIE, '', 0))
  if (!token) return null
  const payload = unsign(token)
  if (payload == null) return null
  let parsed: DiscordStatePayload
  try {
    parsed = JSON.parse(payload) as DiscordStatePayload
  } catch {
    return null
  }
  if (typeof parsed.state !== 'string' || parsed.state !== incomingState) return null
  if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) return null
  return parsed
}
