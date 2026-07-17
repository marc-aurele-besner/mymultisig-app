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
  const [dataIsLoading, setDataIsLoading] = useState(false)
  const [requestDetails, setRequestDetails] = useState<MultiSigTransactionRequest | null>(null)
  const { multiSigTransactionRequests } = useMultiSigs()

  useEffect(() => {
    if (chain && !dataIsLoading && address) {
      setDataIsLoading(true)
      getMultiSigRequestById(multiSigRequestId).then((data) => {
        if (data && data.content) setRequestDetails(data.content[0])
      })
    }
  }, [multiSigTransactionRequests, dataIsLoading, chain, address, multiSigRequestId])

  return requestDetails
}

export default useMultiSigRequestDetails
