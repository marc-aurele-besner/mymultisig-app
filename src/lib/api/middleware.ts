import { eq, sql } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDb } from '../db/neon'
import { multisigRequests, multisigWallets } from '../db/schema'
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

// Session + owner-of-this-wallet: looks up the request row, joins the
// multisig_wallets row to read the owners array, and rejects when the
// verified wallet isn't on the list. Used by every mutation that affects
// the request's lifecycle (PATCH/DELETE/cancel/reset) so a signed-in
// wallet can't tamper with requests it doesn't own.
//
// 401: no session. 400: missing id. 404: row not found. 403: not an owner.
//
// Breaking change vs the old withSession-only wrappers: a non-owner
// wallet that previously could PATCH any request by id now gets 403.
// Every existing in-app PATCH site runs as the submitter, who is by
// definition an owner, so the blast radius is limited to shared-machine
// profiles that swap between owner wallets in one session.
//
// The wallet address join is case-insensitive (LOWER) because users paste
// addresses in mixed case. When the wallet row is missing (e.g. legacy
// pre-0.5.0 imports that never registered), owners is empty and we treat
// that as a non-owner — the safe default.
export const withVerifiedAsOwner = <T extends unknown[] = []>(
  extractId: (req: NextApiRequest) => string | null,
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    address: string,
    requestId: string,
    ...rest: T
  ) => Promise<unknown> | unknown
): Handler<T> => async (req, res, ...rest) => {
  const verified = getVerifiedAddress(req)
  if (verified == null) {
    return res.status(401).json({ message: 'Wallet not verified: sign in with your wallet first' })
  }
  const id = extractId(req)
  if (id == null) return res.status(400).json({ message: 'Missing request id' })
  const db = getDb()
  const rows = await db
    .select({ owners: multisigWallets.owners })
    .from(multisigRequests)
    .leftJoin(
      multisigWallets,
      sql`LOWER(${multisigWallets.address}) = LOWER(${multisigRequests.multiSigAddress})`
    )
    .where(eq(multisigRequests.id, id))
    .limit(1)
  if (rows.length === 0) return res.status(404).json({ message: 'Data not found' })
  const owners = ((rows[0].owners ?? []) as string[]).map((o) => o.toLowerCase())
  if (owners.length > 0 && !owners.includes(verified)) {
    return res.status(403).json({ message: 'Only an owner of this wallet can modify this request' })
  }
  return handler(req, res, verified, id, ...rest)
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
