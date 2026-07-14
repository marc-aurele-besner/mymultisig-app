import { useEffect, useState } from 'react'
import { useChainId, useChains } from 'wagmi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import { signData, getContent } from '../utils'

const useMultiSigRequests = (multiSigAddress: `0x${string}`) => {
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const [dataIsLoading, setDataIsLoading] = useState(false)
  const [request, setRequest] = useState<MultiSigTransactionRequest[] | null>(null)

  useEffect(() => {
    if (chain && !dataIsLoading) {
      setDataIsLoading(true)
      signData({
        action: 'getMultiSigRequests',
        chainId: chain.id,
        collection: 'multisig-requests',
        data: {
          multiSigAddress
        },
        details: 'Get MultiSig Request',
        signatureExpiry: 0
      }).then(async (dataSigned) => {
        getContent(dataSigned.message).then((data) => {
          if (data && data.content) setRequest(data.content)
        })
      })
    }
  }, [dataIsLoading, chain, multiSigAddress])

  return request
}

export default useMultiSigRequests
