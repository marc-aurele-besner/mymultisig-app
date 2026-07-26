import { useCallback, useEffect, useState } from 'react'
import { useChainId, useChains } from 'wagmi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import { listMultiSigRequests } from '../utils'

const useMultiSigRequests = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const [requests, setRequests] = useState<MultiSigTransactionRequest[] | null>(null)
  // The wallet's current nonce, joined server-side on GET. Used by
  // useRequestQueue to mark the request at the wallet's current nonce as
  // "Next" in the queue.
  const [walletNonce, setWalletNonce] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const fetchRequests = useCallback(async () => {
    if (!chain) return
    setIsLoading(true)
    setIsError(false)
    try {
      const data = (await listMultiSigRequests(multiSigAddress)) as {
        content?: MultiSigTransactionRequest[]
        walletNonce?: number | null
      }
      if (data != null && Array.isArray(data.content)) {
        setRequests(data.content)
        setWalletNonce(data.walletNonce ?? null)
      } else {
        setIsError(true)
      }
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [chain, multiSigAddress])

  useEffect(() => {
    setRequests(null)
    setWalletNonce(null)
    void fetchRequests()
  }, [fetchRequests])

  return { requests, walletNonce, isLoading, isError, refetch: fetchRequests }
}

export default useMultiSigRequests
