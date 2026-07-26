import { useEffect, useState } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'

import { useNotificationSuccess, useNotificationError } from './notifications'
import useMultiSigs from '../states/multiSigs'
import { cancelMultiSigRequest } from '../utils'

// Owner-initiated cancel. Distinct from useDeleteMultiSigRequest (which
// hard-removes the row) and useResetMultiSigRequest (which only wipes
// signatures). Marks the row isActive=false / isCancelled=true, sets
// dateCancelled + cancelledBy, and runs the server-side cascade so any
// active request in the same wallet with a strictly greater effective
// nonce has its signatures wiped.
//
// Returns isCancelled so the detail view can swap the Cancel button to
// a "Already cancelled" state.

const useCancelMultiSigRequest = (multiSigRequestId: string, existingRequestId: string, isConfirmed: boolean) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const { updateMultiSigTransactionRequest, removeMultiSigTransactionRequest } = useMultiSigs()
  const [isCancelled, setIsCancelled] = useState(false)
  const notificationError = useNotificationError(
    'Error cancelling request',
    'The request could not be cancelled.'
  )
  const notificationSuccess = useNotificationSuccess(
    'Request cancelled',
    'The request was cancelled and downstream signatures were wiped.'
  )

  useEffect(() => {
    if (chain && isConfirmed) {
      cancelMultiSigRequest(existingRequestId)
        .then((data: { content?: unknown; cascade?: { cancelledIds?: string[] } }) => {
          if (data?.content != null) {
            updateMultiSigTransactionRequest(multiSigRequestId, data.content as never)
          }
          // Cascade recipients: server returns their ids in cancelledIds.
          // Remove them from local Zustand so the list view converges
          // without waiting for the next refetch.
          for (const cascadeId of data?.cascade?.cancelledIds ?? []) {
            removeMultiSigTransactionRequest(cascadeId)
          }
          notificationSuccess()
          setIsCancelled(true)
        })
        .catch((error) => {
          console.error(error)
          notificationError()
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain, isConfirmed, multiSigRequestId, existingRequestId])

  return isCancelled
}

export default useCancelMultiSigRequest