// Cascade invalidation. When a request is reset, executed (success or
// failure), or manually cancelled, other active requests in the same wallet
// have their signatures wiped and are marked cancelled. This is the on-chain
// queue semantics that the issue requests: "Auto reset all requests
// signatures if one request is reset or fail in queue."
//
// Implementation: a single UPDATE…RETURNING scoped to the same wallet
// address (case-insensitive), with the cascade predicate inlined as
// SQL. This is atomic, bounded by the (multi_sig_address, is_active)
// index, and avoids the round-trip-plus-JS-filter alternative that
// would race against concurrent cascades. UserOp requests are excluded
// (they use the EntryPoint nonce, not the wallet's transaction nonce).
//
// Execution ('executed' / 'failed' — a TxFailure still consumes the nonce):
//   every other request is cancelled. Executing at effective nonce E moves
//   the wallet nonce past E, so requests pinned at or below E and unpinned
//   requests (signed at a wallet nonce no higher than E) can never execute;
//   requests pinned above E are reset so owners re-confirm the queue.
//
// Reset / manual cancel (nothing changed on-chain):
//   - Unpinned source (effective nonce = walletNonce): every other unpinned
//     request and everything pinned above the wallet nonce — the issue's
//     "all requests in queue after it" semantic.
//   - Pinned source: requests pinned strictly above the source's nonce.
//     Unpinned requests are kept: they execute at the wallet's current
//     nonce, not at the pinned slot.
//
// txn_nonce is a TEXT column, so nonces are compared through
// pinnedNonceNumeric (numeric cast) — a text comparison would rank '10'
// below '9'.

import { and, eq, isNull, sql, SQL } from 'drizzle-orm'

import { getDb } from '../db/neon'
import { multisigRequests } from '../db/schema'

export type CascadeTrigger = 'executed' | 'failed' | 'reset' | 'cancelled'

export type CascadeResult = {
  cancelledIds: string[]
}

export type CascadeSource = {
  id: string
  multiSigAddress: string
  txnNonce: string | null | undefined
}

const DIGITS = /^\d+$/

// txn_nonce as a number, or NULL when unpinned (or not a plain integer).
export const pinnedNonceNumeric = (): SQL =>
  sql`(CASE WHEN ${multisigRequests.txnNonce} ~ '^[0-9]+$' THEN (${multisigRequests.txnNonce})::numeric END)`

const isPinned = (txnNonce: string | null | undefined): txnNonce is string => txnNonce != null && DIGITS.test(txnNonce)

// The cascade a request's stored state calls for: executed (or failed),
// cancelled, or reset (live but with no signatures left). null for a live
// request that still holds signatures.
export const triggerFromState = (source: {
  isExecuted: boolean
  isSuccessful: boolean
  isCancelled: boolean
  signatures: string[]
}): CascadeTrigger | null => {
  if (source.isExecuted) return source.isSuccessful ? 'executed' : 'failed'
  if (source.isCancelled) return 'cancelled'
  if ((source.signatures ?? []).length === 0) return 'reset'
  return null
}

export const cascadePredicate = (source: CascadeSource, trigger: CascadeTrigger, walletNonce: string): SQL => {
  // Execution consumes the source nonce (and, on Extended wallets, every
  // nonce below a pinned one), so nothing else in the queue survives as-is.
  if (trigger === 'executed' || trigger === 'failed') return sql`TRUE`
  if (isPinned(source.txnNonce)) return sql`${pinnedNonceNumeric()} > ${source.txnNonce}::numeric`
  return sql`(${isNull(multisigRequests.txnNonce)}) OR (${pinnedNonceNumeric()} > ${walletNonce}::numeric)`
}

export const cascadeInvalidate = async (
  source: CascadeSource,
  trigger: CascadeTrigger,
  walletNonce: number | bigint | null
): Promise<CascadeResult> => {
  const db = getDb()
  const walletNonceStr = walletNonce != null ? String(walletNonce) : '0'

  const cancelled = await db
    .update(multisigRequests)
    .set({
      signatures: [],
      ownerSigners: [],
      isActive: false,
      isCancelled: true,
      cancelledBy: 'cascade',
      dateCancelled: new Date().toISOString()
    })
    .where(
      and(
        sql`LOWER(${multisigRequests.multiSigAddress}) = LOWER(${source.multiSigAddress})`,
        eq(multisigRequests.isActive, true),
        eq(multisigRequests.isExecuted, false),
        eq(multisigRequests.isCancelled, false),
        sql`(${multisigRequests.id}) <> ${source.id}`,
        // UserOps use the EntryPoint nonce — exclude from wallet-nonce cascade.
        sql`(${multisigRequests.request}->>'mode') IS DISTINCT FROM 'userop'`,
        cascadePredicate(source, trigger, walletNonceStr)
      )
    )
    .returning({ id: multisigRequests.id })

  return { cancelledIds: cancelled.map((row) => row.id) }
}
