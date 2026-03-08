import React, { Fragment, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import SignRequest from '../buttons/SignRequest'
import ExecuteRequest from '../buttons/ExecuteRequest'
import useMultiSigRequestDetails from '../../hooks/useMultiSigRequestDetails'
import useDeleteMultiSigRequest from '../../hooks/useDeleteMultiSigRequest'
import useResetMultiSigRequest from '../../hooks/useResetMultiSigRequest'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigRequestDetailProps {
  address: `0x${string}`
  multiSigRequestId: string
}

const MultiSigRequestDetail: React.FC<MultiSigRequestDetailProps> = ({
  address,
  multiSigRequestId
}) => {
  const [isDeleted, setIsDeleted] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const requestDetails = useMultiSigRequestDetails(multiSigRequestId)
  const { multiSigDetails } = useMultiSigDetails(
    requestDetails != null ? requestDetails.data.multiSigAddress : '0x',
    address
  )

  const deleted = useDeleteMultiSigRequest(multiSigRequestId, multiSigRequestId, isDeleted)
  const { setSelectedMultiSigTransactionRequest } = useMultiSigs()

  useResetMultiSigRequest(multiSigRequestId, multiSigRequestId, isReset)
  if (deleted) setSelectedMultiSigTransactionRequest(null)

  if (requestDetails == null || multiSigDetails == null) return null

  const row = (label: string, value: React.ReactNode) => (
    <div key={label} className="flex flex-wrap items-center gap-2">
      <span className="px-2 pt-2 text-xl font-bold text-foreground">{label}</span>
      <span className="px-2 pt-2 text-lg font-bold text-foreground">{value}</span>
    </div>
  )

  return (
    <Fragment>
      <div className="flex gap-2 px-6">
        <Button asChild>
          <Link href={`/multisig/${requestDetails.data.multiSigAddress}/buildRequest`}>
            Build a request
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/multisig/${requestDetails.data.multiSigAddress}/requests`}>
            Consult requests
          </Link>
        </Button>
      </div>
      <div className="mt-4 rounded-lg border border-border p-4">
        {row('Description', requestDetails.data.description)}
        {row(
          'Submitted date',
          new Date(Number(requestDetails.data.dateSubmitted)).toLocaleDateString()
        )}
        {row('Target', requestDetails.data.request.to)}
        <div className="flex flex-wrap items-start gap-2">
          <span className="px-2 pt-2 text-xl font-bold text-foreground">Data</span>
          <Textarea
            readOnly
            defaultValue={requestDetails.data.request.data}
            className="min-h-[80px] flex-1"
          />
        </div>
        {row('Value', requestDetails.data.request.value)}
        {row('Tx. Gas', requestDetails.data.request.txnGas)}
        {row(
          'Signatures qty. / Threshold',
          `${requestDetails.data.signatures.length} / ${multiSigDetails.threshold}`
        )}
        {requestDetails.data.isExecuted ? (
          <div className="px-2 pt-2 text-xl font-bold text-green-600 dark:text-green-400">
            This request has been executed
            {requestDetails.data.dateExecuted != null &&
              ` on the ${new Date(Number(requestDetails.data.dateExecuted)).toLocaleDateString()}`}
          </div>
        ) : (
          <Fragment>
            {requestDetails.data.signatures.length >= multiSigDetails.threshold && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 pt-2 text-xl font-bold text-foreground">
                  Execute this request
                </span>
                <ExecuteRequest
                  multiSigAddress={requestDetails.data.multiSigAddress}
                  args={requestDetails.data.request}
                  requestDetails={requestDetails.data}
                  existingRequestRef={requestDetails.data.id}
                />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 pt-2 text-xl font-bold text-foreground">Sign this request</span>
              {requestDetails.data.ownerSigners.find((s) => s === address) != null ? (
                <span className="px-2 pt-2 text-xl font-bold text-green-600 dark:text-green-400">
                  You already signed this request
                </span>
              ) : (
                <SignRequest
                  multiSigAddress={requestDetails.data.multiSigAddress}
                  args={requestDetails.data.request}
                  description={requestDetails.data.description}
                  requestDetails={requestDetails.data}
                  existingRequestRef={requestDetails.data.id}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 pt-2 text-xl font-bold text-foreground">Clear signatures</span>
              <Button variant="outline" className="mx-2 mt-2" onClick={() => setIsReset(true)}>
                Reset signatures
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 pt-2 text-xl font-bold text-foreground">Delete this request</span>
              <Button
                variant="destructive"
                className="mx-2 mt-2"
                onClick={() => setIsDeleted(true)}
              >
                Delete
              </Button>
            </div>
          </Fragment>
        )}
      </div>
      <div className="flex justify-center">
        <Button asChild className="m-4">
          <Link
            href={`/multisig/${requestDetails.data.multiSigAddress}/requests`}
            onClick={() => setSelectedMultiSigTransactionRequest(null)}
          >
            View a different request
          </Link>
        </Button>
      </div>
    </Fragment>
  )
}

export default MultiSigRequestDetail
