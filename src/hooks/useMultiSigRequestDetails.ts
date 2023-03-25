import { useEffect, useState } from 'react'
import { useNetwork, useAccount } from 'wagmi'

import { MultiSigRequestDB } from '../models/MultiSigs'
import useMultiSigs from '../states/multiSigs'
import { signData, getContent } from '../utils'

const useMultiSigRequestDetails = (multiSigRequestId: string) => {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [dataIsLoading, setDataIsLoading] = useState(false)
  const [requestDetails, setRequestDetails] = useState<MultiSigRequestDB | null>(null)
  const { multiSigTransactionRequests } = useMultiSigs()

  useEffect(() => {
    if (chain && !dataIsLoading && address) {
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
  }, [multiSigTransactionRequests, dataIsLoading, chain, address, multiSigRequestId])

  return requestDetails
}

export default useMultiSigRequestDetails
