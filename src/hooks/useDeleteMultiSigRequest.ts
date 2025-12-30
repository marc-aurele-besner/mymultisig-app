import { useEffect, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'

import { useNotificationSuccess, useNotificationError } from './notifications'
import useMultiSigs from '../states/multiSigs'
import { signData, deleteContent } from '../utils'

const useDeleteMultiSigRequest = (multiSigRequestId: string, existingRequestRef: string, isConfirmed: boolean) => {
  const { chain } = useNetwork()
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
        data: { existingRequestRef },
        details: 'Delete MultiSig Request',
        signatureExpiry: 0
      }).then(async (dataSigned) => {
        deleteContent(dataSigned.message, existingRequestRef)
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
  }, [address, chain, isConfirmed, multiSigRequestId, existingRequestRef])

  return isDeleted
}

export default useDeleteMultiSigRequest
