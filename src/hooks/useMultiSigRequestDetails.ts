import { useEffect, useState } from 'react'
import { useChainId, useChains, useAccount } from 'wagmi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { getMultiSigRequestById } from '../utils'

const useMultiSigRequestDetails = (multiSigRequestId: string) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const [requestDetails, setRequestDetails] = useState<MultiSigTransactionRequest | null>(null)
  const { multiSigTransactionRequests } = useMultiSigs()

  // Refetch whenever the Zustand store updates (sign / execute / reset / delete
  // all patch `multiSigTransactionRequests`) so the detail view re-renders.
  // An earlier version gated this behind a `dataIsLoading` flag that was set
  // to true on the first run and never reset, which prevented every
  // subsequent refetch — see issue #69.
  useEffect(() => {
    if (!chain || !address) return
    let cancelled = false
    getMultiSigRequestById(multiSigRequestId).then((data) => {
      if (cancelled) return
      if (data && data.content) setRequestDetails(data.content[0])
    })
    return () => {
      cancelled = true
    }
  }, [multiSigTransactionRequests, chain, address, multiSigRequestId])

  return requestDetails
}

export default useMultiSigRequestDetails
