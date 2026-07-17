import { NextApiRequest, NextApiResponse } from 'next'

import { getVerifiedAddress } from '../auth/siwe'

type Handler<T extends unknown[] = []> = (req: NextApiRequest, res: NextApiResponse, ...rest: T) => Promise<unknown> | unknown
type SessionHandler<T extends unknown[] = []> = (
  req: NextApiRequest,
  res: NextApiResponse,
  address: string,
  ...rest: T
) => Promise<unknown> | unknown

// Reject the request when the caller has no SIWE session cookie, then hand
// the verified address to the handler. Every dedicated write endpoint rides
// on this so the 401 message + status stay consistent. Extra trailing args
// are forwarded unchanged so routes like /api/.../[id] can keep carrying the
// captured id through the wrapper.
export const withSession = <T extends unknown[] = []>(handler: SessionHandler<T>): Handler<T> => async (
  req,
  res,
  ...rest
) => {
  const address = getVerifiedAddress(req)
  if (address == null) {
    return res.status(401).json({ message: 'Wallet not verified: sign in with your wallet first' })
  }
  return handler(req, res, address, ...rest)
}

// Session + identity match: extract the address a payload claims to act as
// (from query, body, or wherever), reject when it is missing or doesn't equal
// the verified wallet. Used by every route that stores data per-owner.
export const withVerifiedAs = <T extends unknown[] = []>(
  extractClaimed: (req: NextApiRequest) => string | null | undefined,
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    claimed: string,
    ...rest: T
  ) => Promise<unknown> | unknown
): Handler<T> => async (req, res, ...rest) => {
  const verified = getVerifiedAddress(req)
  if (verified == null) {
    return res.status(401).json({ message: 'Wallet not verified: sign in with your wallet first' })
  }
  const claimed = extractClaimed(req)
  if (claimed == null || verified !== String(claimed).toLowerCase()) {
    return res.status(401).json({ message: 'Identity does not match the verified wallet' })
  }
  return handler(req, res, claimed, ...rest)
}

// Next.js usually pre-parses JSON bodies, but the legacy {action, data}
// envelope arrived as a string in some hot paths. Tolerate both shapes so
// new endpoints don't have to repeat the dance.
export const parseBody = <T = Record<string, unknown>>(req: NextApiRequest): T => {
  const body = req.body as unknown
  if (typeof body === 'string') return JSON.parse(body) as T
  if (body == null) return {} as T
  return body as T
}

// Path-captured id from /api/.../[id] routes. Returns null when missing or
// an array (Next.js widens repeated keys) so callers can decide their own
// 400 contract instead of throwing a 500.
export const parseIdParam = (req: NextApiRequest): string | null => {
  const id = req.query.id
  if (typeof id !== 'string') return null
  if (id.length === 0) return null
  return id
}

// Coerce req.query into a flat {string: string} map. Next.js types every
// value as `string | string[] | undefined`; most dedicated endpoints only
// care about single-value keys, so collapse the rest into empty strings.
export const parseQueryString = (req: NextApiRequest): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}

export type { Handler, SessionHandler }
