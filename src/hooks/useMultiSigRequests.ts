import { useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import { signData, getContent } from '../utils'

const useMultiSigRequests = (multiSigAddress: `0x${string}`) => {
  const { chain } = useNetwork()
  const [dataIsLoading, setDataIsLoading] = useState(false)
  const [request, setRequest] = useState<
    | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref: any
        data: MultiSigTransactionRequest
      }[]
    | null
  >(null)

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
