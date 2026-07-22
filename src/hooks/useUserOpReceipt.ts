import { useEffect, useState } from 'react'

import { UserOpReceipt } from '../models/MultiSigs'
import { getUserOperationReceipt } from '../utils/bundler'

// Poll a bundler for a UserOp's receipt. The hook polls on a fixed interval
// until `success` is set or the timeout elapses, then returns the receipt
// (or null on timeout). Caller decides what to do with success/failure.
const useUserOpReceipt = (
  bundlerUrl: string | undefined,
  userOpHash: `0x${string}` | undefined,
  {
    timeout = 120_000,
    interval = 2_000,
    enabled = true
  }: { timeout?: number; interval?: number; enabled?: boolean } = {}
) => {
  const [receipt, setReceipt] = useState<UserOpReceipt | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || bundlerUrl == null || userOpHash == null) return
    let cancelled = false
    const deadline = Date.now() + timeout
    setIsPolling(true)
    setError(null)
    const poll = async () => {
      if (cancelled) return
      if (Date.now() > deadline) {
        setIsPolling(false)
        setError(new Error(`Bundler receipt for ${userOpHash} did not arrive within ${timeout}ms`))
        return
      }
      try {
        const r = await getUserOperationReceipt(bundlerUrl, userOpHash)
        if (cancelled) return
        if (r != null) {
          const mapped: UserOpReceipt = {
            userOpHash: r.userOpHash,
            txHash: r.receipt.transactionHash,
            blockHash: r.receipt.blockHash,
            blockNumber: r.receipt.blockNumber,
            success: r.success,
            ...(r.reason != null ? { reason: r.reason } : {})
          }
          setReceipt(mapped)
          setIsPolling(false)
          return
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
      }
      setTimeout(() => {
        void poll()
      }, interval)
    }
    void poll()
    return () => {
      cancelled = true
      setIsPolling(false)
    }
  }, [bundlerUrl, userOpHash, enabled, timeout, interval])

  return { receipt, isPolling, error }
}

export default useUserOpReceipt
