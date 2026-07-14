import { useCallback, useEffect, useState } from 'react'
import { useChainId, useChains } from 'wagmi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import { signData, getContent } from '../utils'

const useMultiSigRequests = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const [requests, setRequests] = useState<MultiSigTransactionRequest[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const fetchRequests = useCallback(async () => {
    if (!chain) return
    setIsLoading(true)
    setIsError(false)
    try {
      const dataSigned = await signData({
        action: 'getMultiSigRequests',
        chainId: chain.id,
        collection: 'multisig-requests',
        data: {
          multiSigAddress
        },
        details: 'Get MultiSig Request',
        signatureExpiry: 0
      })
      const data = await getContent(dataSigned.message)
      if (data != null && Array.isArray(data.content)) {
        setRequests(data.content)
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
    void fetchRequests()
  }, [fetchRequests])

  return { requests, isLoading, isError, refetch: fetchRequests }
}

export default useMultiSigRequests
