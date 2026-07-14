import { useEffect, useState } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'

import { useNotificationSuccess, useNotificationError } from './notifications'
import useMultiSigs from '../states/multiSigs'
import { signData, deleteContent } from '../utils'

const useDeleteMultiSigRequest = (multiSigRequestId: string, existingRequestId: string, isConfirmed: boolean) => {
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const { address } = useAccount()
  const { removeMultiSigTransactionRequest } = useMultiSigs()
  const [isDeleted, setIsDeleted] = useState(false)
  const notificationError = useNotificationError(
    'Error Deleting MultiSig Request',
    'There was an error deleting MultiSig request.'
  )
  const notificationSuccess = useNotificationSuccess(
    'Successfully Deleted MultiSig Request',
    'You deleted the MultiSig request successfully.'
  )

  useEffect(() => {
    if (chain && isConfirmed) {
      signData({
        action: 'deleteMultiSigRequest',
        chainId: chain.id,
        collection: 'multisig-requests',
        data: { existingRequestId },
        details: 'Delete MultiSig Request',
        signatureExpiry: 0
      }).then(async (dataSigned) => {
        deleteContent(dataSigned.message, existingRequestId)
          .then(() => {
            removeMultiSigTransactionRequest(multiSigRequestId)
            notificationSuccess()
            setIsDeleted(true)
          })
          .catch((error) => {
            console.error(error)
            notificationError()
          })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain, isConfirmed, multiSigRequestId, existingRequestId])

  return isDeleted
}

export default useDeleteMultiSigRequest
