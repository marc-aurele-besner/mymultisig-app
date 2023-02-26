import { useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'

import { MultiSigTransactionRequest } from '../models/MultiSigs'
import { signData, getContent } from '../utils'

const useMultiSigRequestDetails = (multiSigRequestId: string) => {
  const { chain } = useNetwork()
  const [dataIsLoading, setDataIsLoading] = useState(false)
  const [requestDetails, setRequestDetails] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any
    data: MultiSigTransactionRequest
  } | null>(null)

  useEffect(() => {
    if (chain && !dataIsLoading) {
      setDataIsLoading(true)
      signData({
        action: 'getMultiSigRequestById',
        chainId: chain.id,
        collection: 'multisig-requests',
        data: {
          multiSigRequestId
        },
        details: 'Add MultiSig Request',
        signatureExpiry: 0
      }).then(async (dataSigned) => {
        getContent(dataSigned.message).then((data) => {
          if (data && data.content) setRequestDetails(data.content[0])
        })
      })
    }
  }, [dataIsLoading, chain, multiSigRequestId])

  return requestDetails
}

export default useMultiSigRequestDetails
