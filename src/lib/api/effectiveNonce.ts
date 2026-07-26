// Effective nonce for queue ordering. A request's position in the queue is
// defined by its effective nonce, which is:
//   - request.txnNonce when the request was pinned to an explicit nonce
//     (Extended wallets; the executor uses the 6-arg overload).
//   - the wallet's current nonce otherwise (the executor uses the 5-arg
//     overload which advances the wallet's nonce automatically).
//
// The dedicated txn_nonce column on multisig_requests mirrors
// request.txnNonce at write time so the cascade predicate and the GET
// ORDER BY can compare as text without touching the JSONB blob. We
// prefer the column over the JSONB field when both exist so a future
// fix-up migration that normalises request.txnNonce in place still picks
// the most up-to-date value.
//
// Returned as a string so callers can compare with < > for ORDER BY and
// WHERE predicates. UUIDs are never compared here.

import type { MultiSigExecTransactionArgs } from '../../models/MultiSigs'

export const effectiveNonce = (
  row: {
    request?: Pick<MultiSigExecTransactionArgs, 'txnNonce'>
    txnNonce?: string | null
  },
  walletNonce?: number | bigint | null
): string => {
  const fromColumn = row.txnNonce
  if (fromColumn != null && fromColumn !== '') return String(fromColumn)
  const fromRequest = row.request?.txnNonce
  if (fromRequest != null && fromRequest !== '') return String(fromRequest)
  return walletNonce != null ? String(walletNonce) : '0'
}

// UserOp requests travel through a bundler and use the EntryPoint nonce,
// not the wallet's transaction nonce. They are excluded from the cascade
// invalidation (the predicate would treat them as "at the wallet's current
// nonce" which is wrong) and pushed to the end of the GET list. The mode
// lives inside the JSONB request column because the same multisig_requests
// table serves both modes.
export const isUserOp = (row: { request?: { mode?: string } }): boolean =>
  row.request?.mode === 'userop'