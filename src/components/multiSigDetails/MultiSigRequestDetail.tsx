import React, { Fragment, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import SignRequest from '../buttons/SignRequest'
import ExecuteRequest from '../buttons/ExecuteRequest'
import ApproveRequest from '../buttons/ApproveRequest'
import useMultiSigRequestDetails from '../../hooks/useMultiSigRequestDetails'
import useDeleteMultiSigRequest from '../../hooks/useDeleteMultiSigRequest'
import useResetMultiSigRequest from '../../hooks/useResetMultiSigRequest'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useRequestApprovalState from '../../hooks/useRequestApprovalState'
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
    requestDetails != null ? requestDetails.multiSigAddress : '0x',
    address
  )
  const { supportsHybrid, txHash, approvedOwners, isValid, refetchApprovals } = useRequestApprovalState(
    requestDetails != null ? requestDetails.multiSigAddress : '0x',
    requestDetails
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

  // Off-chain ECDSA signers and on-chain approvers both count toward the
  // threshold (the contract counts approvals first, then signatures, and
  // refuses double votes).
  const signerSet = new Set(requestDetails.ownerSigners.map((s) => s.toLowerCase()))
  const approverSet = new Set(approvedOwners.map((s) => s.toLowerCase()))
  const combined = new Set([...signerSet, ...approverSet])
  const hasSigned = signerSet.has(address.toLowerCase())
  const hasApproved = approverSet.has(address.toLowerCase())
  const thresholdReached = combined.size >= multiSigDetails.threshold
  // isValidSignature preflight: only block execution on an explicit false from
  // a wallet that supports it (older wallets can't answer).
  const preflightBlocked = supportsHybrid && thresholdReached && isValid === false
  const batchSteps = requestDetails.request.batchSteps
  const batchResults = requestDetails.request.batchResults

  return (
    <Fragment>
      <div className="flex gap-2 px-6">
        <Button asChild>
          <Link href={`/multisig/${requestDetails.multiSigAddress}/buildRequest`}>
            Build a request
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/multisig/${requestDetails.multiSigAddress}/requests`}>
            Consult requests
          </Link>
        </Button>
      </div>
      <div className="mt-4 rounded-lg border border-border p-4">
        {row('Description', requestDetails.description)}
        {row(
          'Submitted date',
          new Date(Number(requestDetails.dateSubmitted)).toLocaleDateString()
        )}
        {row('Target', requestDetails.request.to)}
        <div className="flex flex-wrap items-start gap-2">
          <span className="px-2 pt-2 text-xl font-bold text-foreground">Data</span>
          <Textarea
            readOnly
            defaultValue={requestDetails.request.data}
            className="min-h-[80px] flex-1"
          />
        </div>
        {row('Value', requestDetails.request.value)}
        {row('Tx. Gas', requestDetails.request.txnGas)}
        {requestDetails.request.txnNonce != null &&
          requestDetails.request.txnNonce !== '' &&
          row('Pinned nonce', requestDetails.request.txnNonce)}
        {row(
          'Approvals / Threshold',
          supportsHybrid
            ? `${combined.size} / ${multiSigDetails.threshold} (${signerSet.size} signature${
                signerSet.size === 1 ? '' : 's'
              }, ${approverSet.size} on-chain)`
            : `${requestDetails.signatures.length} / ${multiSigDetails.threshold}`
        )}

        {batchSteps != null && batchSteps.length > 0 && (
          <div className="mt-2 flex flex-col gap-2 px-2">
            <span className="text-xl font-bold text-foreground">Batch steps</span>
            <p className="text-sm text-muted-foreground">
              Steps run in order; a failed step does not revert the others.
            </p>
            {batchSteps.map((step, i) => {
              const result = batchResults?.[i]
              return (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded border border-border p-2 text-sm">
                  <span className="font-semibold text-foreground">#{i + 1}</span>
                  <span className="font-mono text-foreground">{step.to}</span>
                  <span className="text-muted-foreground">value {step.value}</span>
                  {result != null && (
                    <span
                      className={`font-semibold ${
                        result.success ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                      }`}
                    >
                      {result.success ? 'succeeded' : `failed${result.returnData !== '0x' ? ` (${result.returnData})` : ''}`}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {requestDetails.isExecuted ? (
          <div className="px-2 pt-2 text-xl font-bold text-green-600 dark:text-green-400">
            This request has been executed
            {requestDetails.dateExecuted != null &&
              ` on the ${new Date(Number(requestDetails.dateExecuted)).toLocaleDateString()}`}
          </div>
        ) : (
          <Fragment>
            {thresholdReached && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 pt-2 text-xl font-bold text-foreground">
                  Execute this request
                </span>
                {preflightBlocked ? (
                  <span className="px-2 pt-2 text-lg font-bold text-destructive">
                    The wallet rejects the collected approvals (owners may have changed or the nonce moved).
                    Reset the signatures and collect them again.
                  </span>
                ) : (
                  <ExecuteRequest
                    multiSigAddress={requestDetails.multiSigAddress}
                    args={requestDetails.request}
                    requestDetails={requestDetails}
                    existingRequestId={requestDetails.id}
                  />
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 pt-2 text-xl font-bold text-foreground">Sign this request</span>
              {hasSigned ? (
                <span className="px-2 pt-2 text-xl font-bold text-green-600 dark:text-green-400">
                  You already signed this request
                </span>
              ) : hasApproved ? (
                <span className="px-2 pt-2 text-lg font-bold text-muted-foreground">
                  You approved on-chain; a signature would be a duplicate vote
                </span>
              ) : (
                <SignRequest
                  multiSigAddress={requestDetails.multiSigAddress}
                  args={requestDetails.request}
                  description={requestDetails.description}
                  requestDetails={requestDetails}
                  existingRequestId={requestDetails.id}
                />
              )}
            </div>
            {supportsHybrid && txHash != null && !hasApproved && !hasSigned && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 pt-2 text-xl font-bold text-foreground">
                  Or approve on-chain
                </span>
                <ApproveRequest
                  multiSigAddress={requestDetails.multiSigAddress}
                  txHash={txHash}
                  onApproved={() => refetchApprovals()}
                />
              </div>
            )}
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
            href={`/multisig/${requestDetails.multiSigAddress}/requests`}
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
