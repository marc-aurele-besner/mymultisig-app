import { useMemo } from 'react'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import { effectiveNonce } from '../lib/api/effectiveNonce'

// Derive queue metadata for a single request out of the server-sorted
// list. The list comes from useMultiSigRequests (already ordered by
// effective nonce ASC, UserOps last). Position is 1-indexed for the UI
// ("#1 of 5"). isNext means this request is at position 1 AND its
// effective nonce matches the wallet's current nonce — i.e. it's the
// one that would actually execute first.

export type QueueMeta = {
  position: number
  total: number
  isNext: boolean
  walletNonce: number | null
}

const useRequestQueue = (
  requests: MultiSigTransactionRequest[] | null | undefined,
  requestId: string,
  walletNonce: number | null
): QueueMeta => {
  return useMemo(() => {
    if (requests == null || requests.length === 0) {
      return { position: 0, total: 0, isNext: false, walletNonce }
    }
    // Only count live requests (active, not cancelled, not executed) in
    // the queue total — executed/cancelled rows are out of the queue even
    // if they linger in the list for the executed badge.
    const live = requests.filter((r) => r.isActive && !r.isExecuted && !r.isCancelled)
    const total = live.length
    const idx = live.findIndex((r) => r.id === requestId)
    const position = idx >= 0 ? idx + 1 : 0
    const me = idx >= 0 ? live[idx] : null
    const myNonce = me != null ? effectiveNonce(me, walletNonce) : null
    const isNext =
      idx === 0 &&
      me != null &&
      walletNonce != null &&
      myNonce === String(walletNonce)
    return { position, total, isNext, walletNonce }
  }, [requests, requestId, walletNonce])
}

export default useRequestQueue