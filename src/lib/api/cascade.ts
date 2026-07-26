// Cascade invalidation. When a request is reset, executed (success or
// failure), or manually cancelled, every other active request in the same
// wallet whose effective nonce is strictly greater than the source's has
// its signatures wiped and is marked cancelled. This is the on-chain
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
// For an unpinned source (effective nonce = walletNonce):
//   - Target pinned at strictly higher nonce: cascade
//   - Target unpinned (NULL txn_nonce): cascade — issue's "all requests in
//     queue after it" semantic. Even though the contract would technically
//     still accept the other's signatures, the user-facing intent is to
//     re-confirm when something in the queue was reset or failed.
//
// For a pinned source (effective nonce = source.txnNonce):
//   - Target pinned at strictly higher nonce: cascade
//   - Target unpinned: NOT cascaded. Unpinned requests will still execute
//     at the current nonce regardless of what was pinned, and their
//     signatures were computed over the wallet's nonce at signing time.

import { and, eq, gt, isNull, sql } from 'drizzle-orm'

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

const cascadePredicate = (source: CascadeSource, walletNonce: string) => {
  const pinned = source.txnNonce != null && source.txnNonce !== ''
  if (pinned) {
    // Strictly greater than the source's pinned nonce. Unpinned targets
    // (NULL txn_nonce) are NOT invalidated — they execute at the wallet's
    // current nonce, not at the pinned nonce slot.
    return gt(multisigRequests.txnNonce, String(source.txnNonce))
  }
  // Unpinned source: invalidate anything pinned above the wallet's current
  // nonce AND every other unpinned request in the queue (the issue's
  // "all requests in queue after it" semantic).
  return sql`(${isNull(multisigRequests.txnNonce)}) OR (${gt(multisigRequests.txnNonce, walletNonce)})`
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
        cascadePredicate(source, walletNonceStr)
      )
    )
    .returning({ id: multisigRequests.id })

  return { cancelledIds: cancelled.map((row) => row.id) }
}