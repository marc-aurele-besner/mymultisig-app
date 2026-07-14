import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MultiSigOnChainData } from '../../models/MultiSigs'
import useMultiSigRequests from '../../hooks/useMultiSigRequests'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigRequestListProps {
  multiSigAddress: `0x${string}`
  multiSigDetails: MultiSigOnChainData
}

const MultiSigRequestList: React.FC<MultiSigRequestListProps> = ({
  multiSigAddress,
  multiSigDetails
}) => {
  const requests = useMultiSigRequests(multiSigAddress)
  const { setSelectedMultiSigTransactionRequest } = useMultiSigs()

  if (multiSigDetails == null || requests == null) return null

  return (
    <div className="rounded-lg border border-border p-4">
      {requests.length > 0 ? (
        requests.map((request) => (
          <div
            key={`Request-${request.id}`}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="px-2 pt-2 text-xl font-bold text-foreground">
              {request.description}
            </span>
            <Link
              href={`/request/${request.id}`}
              onClick={() => setSelectedMultiSigTransactionRequest(request.id)}
              className="ml-auto mr-8"
            >
              <Button>Select</Button>
            </Link>
          </div>
        ))
      ) : (
        <p className="px-2 pt-2 text-xl font-bold text-foreground">No requests</p>
      )}
    </div>
  )
}

export default MultiSigRequestList
