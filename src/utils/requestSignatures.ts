import type { MultiSigTransactionRequest } from '../models/MultiSigs'

// The request reads only return raw signatures to the wallet's signed-in
// owners (src/lib/api/signatureAccess.ts). For everyone else `signatures`
// is [] and `signaturesRedacted` is set, while `ownerSigners` still lists
// every signer, so counts read from it.
export const signatureCount = (
  request: Pick<MultiSigTransactionRequest, 'signatures' | 'ownerSigners' | 'signaturesRedacted'>
) => (request.signaturesRedacted === true ? (request.ownerSigners ?? []).length : request.signatures.length)

export const REDACTED_SIGNATURES_MESSAGE =
  'The collected signatures are only shared with signed-in owners. Sign in with an owner wallet and reload the request first.'
