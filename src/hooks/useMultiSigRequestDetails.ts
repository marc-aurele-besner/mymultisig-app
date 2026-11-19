import { useEffect, useState } from 'react'
import { useChainId, useChains, useAccount } from 'wagmi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { getMultiSigRequestById } from '../utils'
import useOnSiweSession from './useOnSiweSession'

const useMultiSigRequestDetails = (multiSigRequestId: string) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const [requestDetails, setRequestDetails] = useState<MultiSigTransactionRequest | null>(null)
  const { multiSigTransactionRequests } = useMultiSigs()
  // Bumped when a SIWE session starts: the row loaded before sign-in has its
  // signatures redacted.
  const [sessionVersion, setSessionVersion] = useState(0)
  useOnSiweSession(() => setSessionVersion((v) => v + 1))

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
  }, [multiSigTransactionRequests, chain, address, multiSigRequestId, sessionVersion])

  return requestDetails
}

export default useMultiSigRequestDetails
