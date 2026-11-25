import type { NextApiRequest } from 'next'

import type { MultiSigTransactionRequest } from '../../models/MultiSigs'
import { Caller, callerMayActOn, resolveCaller } from './middleware'
import { readBearerToken } from '../auth/apiKey'

// Raw off-chain signatures are bearer credentials: anyone holding a
// threshold of them can submit the transaction on-chain, and on Extended
// wallets surplus or cancelled signatures can be replayed. The public request
// reads therefore serve them only to the wallet's own owners (SIWE session or
// an API key with the `read` scope). Everyone else gets the request with
// `signatures: []`, an empty combined blob and `signaturesRedacted: true`;
// `ownerSigners` stays so the UI can still show who signed and how many.

export type ReaderResult = { ok: true; caller: Caller | null } | { ok: false; status: number; message: string }

// Who is reading. No credentials at all is an anonymous reader, not an
// error. A Bearer key that fails to resolve is an error, so an agent with a
// broken key is told so instead of silently getting redacted data.
export const resolveReader = async (req: NextApiRequest): Promise<ReaderResult> => {
  const hasToken = readBearerToken(req) != null
  const result = await resolveCaller(req, { apiKeyScope: 'read' })
  if (result.ok) return { ok: true, caller: result.caller }
  if (hasToken) return result
  return { ok: true, caller: null }
}

// True when `caller` may see the raw signatures of a request on the wallet
// with `owners`. Wallets with no stored owner list (pre-0.5.0 imports) fall
// back to the request's own participants: its submitter and signers.
export const canReadSignatures = (
  caller: Caller | null,
  multiSigAddress: string,
  owners: readonly string[] | null | undefined,
  request: Pick<MultiSigTransactionRequest, 'submitter' | 'ownerSigners'>
): boolean => {
  if (caller == null) return false
  if (!callerMayActOn(caller, multiSigAddress)) return false
  const me = caller.address.toLowerCase()
  const ownerList = (owners ?? []).map((o) => o.toLowerCase())
  if (ownerList.length > 0) return ownerList.includes(me)
  const participants = [request.submitter, ...(request.ownerSigners ?? [])].map((a) => String(a).toLowerCase())
  return participants.includes(me)
}

export const redactSignatures = (request: MultiSigTransactionRequest): MultiSigTransactionRequest => ({
  ...request,
  signatures: [],
  request: { ...request.request, signatures: '' },
  signaturesRedacted: true
})

export const withSignatureAccess = (
  request: MultiSigTransactionRequest,
  caller: Caller | null,
  owners: readonly string[] | null | undefined
): MultiSigTransactionRequest =>
  canReadSignatures(caller, request.multiSigAddress, owners, request) ? request : redactSignatures(request)

type StoredSignatures = {
  signatures: string[]
  ownerSigners: string[]
  request: unknown
}

const sameEntry = (a: unknown, b: string) => typeof a === 'string' && a.toLowerCase() === b.toLowerCase()

const keepsPrefix = (stored: readonly string[], next: readonly unknown[]) =>
  stored.every((value, i) => sameEntry(next[i], value))

const SIGNATURES_CONFLICT =
  'Stored signatures can only be added to, or cleared by a reset. Reload the request as a signed-in owner and try again.'

// PATCH guard: `signatures` / `ownerSigners`, when sent, must keep every
// stored entry in place and only append, or be [] (a reset). Returns the
// 409 message, or null when the patch is acceptable.
export const checkSignaturesPatch = (existing: StoredSignatures, patch: Record<string, unknown>): string | null => {
  for (const field of ['signatures', 'ownerSigners'] as const) {
    const next = patch[field]
    if (next === undefined) continue
    if (!Array.isArray(next)) return `${field} must be an array`
    if (next.length > 0 && !keepsPrefix(existing[field] ?? [], next)) return SIGNATURES_CONFLICT
  }
  return null
}

const blobOf = (request: unknown): string => {
  const value = (request as { signatures?: unknown } | null | undefined)?.signatures
  return typeof value === 'string' ? value : ''
}

// The `request` JSON to store for a PATCH. A patch whose `request` lacks
// the combined signature blob (built from a redacted read) keeps the stored
// blob, unless the patch is a reset (`signatures: []`).
export const keepSignatureBlob = (
  existing: StoredSignatures,
  patch: Record<string, unknown>
): Record<string, unknown> => {
  const stored = (existing.request ?? {}) as Record<string, unknown>
  if (patch.request == null || typeof patch.request !== 'object') return stored
  const next = patch.request as Record<string, unknown>
  const isReset = Array.isArray(patch.signatures) && patch.signatures.length === 0
  if (!isReset && blobOf(next) === '' && blobOf(stored) !== '') return { ...next, signatures: blobOf(stored) }
  return next
}
