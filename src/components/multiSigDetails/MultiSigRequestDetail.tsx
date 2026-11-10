import React, { Fragment, useState } from 'react'
import Link from 'next/link'
import { useAccount, useChainId, useChains } from 'wagmi'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatNativeAmount } from '../../utils/formatNativeAmount'
import { formatRequestDate } from '../../utils/requestDate'
import truncateAddress from '../../utils/truncateAddress'
import { useAddressLabels } from '../../states/addressBook'
import SignRequest from '../buttons/SignRequest'
import ExecuteRequest from '../buttons/ExecuteRequest'
import ApproveRequest from '../buttons/ApproveRequest'
import RevokeApproval from '../buttons/RevokeApproval'
import CancelRequestButton from './CancelRequestButton'
import ScheduledExecutionPanel from './ScheduledExecutionPanel'
import UserOpRequestCard from './UserOpRequestCard'
import ShareRequestLink from './ShareRequestLink'
import ExecutionOutcome, { ExecutionOutcomeKind } from './ExecutionOutcome'
import { isModernWallet } from '../../utils/contractVersions'
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

// Label above a value in the details grid. Hoisted so it is not re-created on
// every render of the parent.
const Detail: React.FC<{ label: string; mono?: boolean; wide?: boolean; children: React.ReactNode }> = ({
  label,
  mono = false,
  wide = false,
  children
}) => (
  <div className={cn('min-w-0', wide && 'md:col-span-2')}>
    <dt className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>{label}</dt>
    <dd className={cn('mt-1 break-all text-sm text-foreground', mono && 'font-mono')}>{children}</dd>
  </div>
)

// One action: title and hint on the left, the control on the right. The
// shared buttons carry legacy `mr-8 mt-4` offsets for the old stacked layout;
// the wrapper zeroes them so the controls line up.
const ActionRow: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({
  title,
  hint,
  children
}) => (
  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6'>
    <div className='min-w-0'>
      <p className='font-semibold text-foreground'>{title}</p>
      {hint != null && <p className='mt-0.5 text-sm text-muted-foreground'>{hint}</p>}
    </div>
    <div className='flex flex-wrap items-center gap-2 [&_button]:m-0'>{children}</div>
  </div>
)

const Callout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive'>
    {children}
  </div>
)

const MultiSigRequestDetail: React.FC<MultiSigRequestDetailProps> = ({ address, multiSigRequestId }) => {
  const [isDeleted, setIsDeleted] = useState(false)
  const [isReset, setIsReset] = useState(false)
  // Amounts are shown in friendly native units by default; this flips them to raw wei.
  const [showRawAmount, setShowRawAmount] = useState(false)
  const chainId = useChainId()
  const chain = useChains().find((c) => c.id === chainId)
  const nativeSymbol = chain?.nativeCurrency.symbol ?? 'ETH'
  const explorerUrl = chain?.blockExplorers?.default.url
  const { labelFor } = useAddressLabels(chain?.id)
  const requestDetails = useMultiSigRequestDetails(multiSigRequestId)
  const { multiSigDetails, onChainOwners } = useMultiSigDetails(
    requestDetails != null ? requestDetails.multiSigAddress : '0x',
    address
  )
  const { supportsHybrid, txHash, approvedOwners, isValid, walletVersion, refetchApprovals } = useRequestApprovalState(
    requestDetails != null ? requestDetails.multiSigAddress : '0x',
    requestDetails
  )

  const deleted = useDeleteMultiSigRequest(multiSigRequestId, multiSigRequestId, isDeleted)
  const { setSelectedMultiSigTransactionRequest } = useMultiSigs()
  // Owner check: prefer on-chain owners (0.5.0); fall back to address
  // being the only listed owner when the contract doesn't expose
  // getOwners (legacy wallets).
  const { address: connectedAddress } = useAccount()
  const isOwner =
    onChainOwners != null
      ? onChainOwners.map((o) => o.toLowerCase()).includes((connectedAddress ?? address).toLowerCase())
      : (connectedAddress ?? address).toLowerCase() !== '0x'

  useResetMultiSigRequest(multiSigRequestId, multiSigRequestId, isReset)
  if (deleted) setSelectedMultiSigTransactionRequest(null)

  if (requestDetails == null || multiSigDetails == null) return null

  // UserOp requests render a dedicated card (personal_sign votes, on-chain
  // approveHash(userOpSigningHash), bundler submit). The classic multisig
  // card below is skipped entirely so the two flows don't conflate.
  if (requestDetails.request.mode === 'userop') {
    return (
      <Fragment>
        <ShareRequestLink requestId={multiSigRequestId} />
        <UserOpRequestCard
          request={requestDetails}
          threshold={multiSigDetails.threshold}
          onDelete={() => setIsDeleted(true)}
          onReset={() => setIsReset(true)}
        />
      </Fragment>
    )
  }

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
  const modern = isModernWallet(walletVersion)
  // 0.5.0 request metadata: signatures die past validUntil (SignatureExpired),
  // and operation 1 runs the payload as a DELEGATECALL on the wallet itself.
  const validUntil = requestDetails.request.validUntil
  const hasExpiry = validUntil != null && validUntil !== '' && validUntil !== '0'
  const isExpired = hasExpiry && Number(validUntil) * 1000 < Date.now()
  const isDelegateCall = requestDetails.request.operation === '1'
  const txnNonce = requestDetails.request.txnNonce
  const hasPinnedNonce = txnNonce != null && txnNonce !== ''

  const approvalCount = supportsHybrid ? combined.size : requestDetails.signatures.length
  const approvalsNeeded = multiSigDetails.threshold
  const approvalsFilled = Math.min(approvalCount, approvalsNeeded)
  const breakdown = supportsHybrid
    ? `${signerSet.size} off-chain signature${signerSet.size === 1 ? '' : 's'} · ${approverSet.size} on-chain approval${
        approverSet.size === 1 ? '' : 's'
      }`
    : `${requestDetails.signatures.length} signature${requestDetails.signatures.length === 1 ? '' : 's'}`

  // Address-book label for an address, or "This multisig" for self-calls.
  const nameFor = (addr: string): string | undefined =>
    labelFor(addr) ??
    (addr.toLowerCase() === requestDetails.multiSigAddress.toLowerCase() ? 'This multisig' : undefined)
  const targetName = nameFor(requestDetails.request.to)
  const targetLabel =
    targetName != null
      ? `${targetName} (${truncateAddress(requestDetails.request.to)})`
      : truncateAddress(requestDetails.request.to)

  // Executed requests split three ways: the wallet's inner call reverted
  // (TxFailure — nonce used, nothing sent), a best-effort batch with some
  // failed steps, or a clean success.
  const failedSteps = batchResults?.filter((r) => !r.success).length ?? 0
  const executionOutcome: ExecutionOutcomeKind = !requestDetails.isSuccessful
    ? 'failed'
    : failedSteps > 0
      ? 'partial'
      : 'success'
  const hasValue = requestDetails.request.value !== '' && requestDetails.request.value !== '0'
  const submittedOn = formatRequestDate(requestDetails.dateSubmitted)

  const statusLabel = requestDetails.isExecuted
    ? executionOutcome === 'failed'
      ? 'Failed'
      : executionOutcome === 'partial'
        ? 'Partially failed'
        : 'Executed'
    : requestDetails.isCancelled
      ? 'Cancelled'
      : isExpired
        ? 'Expired'
        : thresholdReached
          ? 'Ready to execute'
          : 'Collecting signatures'
  const statusClass =
    requestDetails.isExecuted && executionOutcome === 'failed'
      ? 'bg-destructive/15 text-destructive'
      : requestDetails.isExecuted && executionOutcome === 'partial'
        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
        : requestDetails.isExecuted || (thresholdReached && !isExpired && !requestDetails.isCancelled)
          ? 'bg-primary text-primary-foreground'
          : isExpired
            ? 'bg-destructive/15 text-destructive'
            : 'border border-border text-muted-foreground'

  return (
    <Fragment>
      <ShareRequestLink requestId={multiSigRequestId} />

      <section className='mt-4 w-full overflow-hidden rounded-xl border border-border bg-card'>
        <header className='flex flex-wrap items-start justify-between gap-4 p-5 md:p-6'>
          <div className='min-w-0'>
            {submittedOn != null && (
              <p className='font-mono text-xs uppercase tracking-wider text-muted-foreground'>
                Submitted {submittedOn}
              </p>
            )}
            <h3 className='mt-1 break-words font-display text-2xl font-bold text-foreground'>
              {requestDetails.description}
            </h3>
          </div>
          <span className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-semibold', statusClass)}>
            {statusLabel}
          </span>
        </header>

        <div className='border-t border-border p-5 md:p-6'>
          <div className='flex flex-wrap items-baseline justify-between gap-2'>
            <p className='text-sm font-semibold text-foreground'>Approvals</p>
            <p className='font-mono text-sm text-foreground'>
              {approvalCount} / {approvalsNeeded}
            </p>
          </div>
          <div className='mt-3 flex gap-1.5' aria-hidden>
            {Array.from({ length: Math.max(approvalsNeeded, 1) }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors duration-500',
                  i < approvalsFilled ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
          <p className='mt-2 text-sm text-muted-foreground'>{breakdown}</p>
        </div>

        <dl className='grid gap-x-8 gap-y-5 border-t border-border p-5 md:grid-cols-2 md:p-6'>
          <Detail label='Target'>
            {targetName != null && <span className='block font-semibold'>{targetName}</span>}
            <span className={cn('block font-mono', targetName != null && 'mt-0.5 text-xs text-muted-foreground')}>
              {requestDetails.request.to}
            </span>
          </Detail>
          <Detail label='Value' mono={showRawAmount}>
            <span className='block'>
              {showRawAmount
                ? `${requestDetails.request.value} wei`
                : formatNativeAmount(requestDetails.request.value, nativeSymbol)}
            </span>
            <button
              type='button'
              className='mt-1 text-xs font-medium text-primary hover:underline'
              onClick={() => setShowRawAmount((raw) => !raw)}
            >
              {showRawAmount ? 'Back to friendly view' : 'Show raw amount (wei)'}
            </button>
          </Detail>
          <Detail label='Tx. gas' mono>
            {requestDetails.request.txnGas}
          </Detail>
          {hasPinnedNonce && (
            <Detail label='Pinned nonce' mono>
              {txnNonce}
            </Detail>
          )}
          {hasExpiry && (
            <Detail label='Signatures expire'>
              <span className={cn(isExpired && 'font-semibold text-destructive')}>
                {new Date(Number(validUntil) * 1000).toLocaleString()}
                {isExpired ? ' — expired' : ''}
              </span>
            </Detail>
          )}
          {isDelegateCall && (
            <Detail label='Operation' wide>
              DELEGATECALL (runs in the wallet’s own storage context)
            </Detail>
          )}
          {batchSteps != null && batchSteps.length > 0 && requestDetails.request.strictBatch === true && (
            <Detail label='Batch mode' wide>
              Atomic — the first failing step reverts every step
            </Detail>
          )}
          <Detail label='Data' mono wide>
            <span className='block max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3'>
              {requestDetails.request.data}
            </span>
          </Detail>
        </dl>

        {batchSteps != null && batchSteps.length > 0 && (
          <div className='border-t border-border p-5 md:p-6'>
            <p className='text-sm font-semibold text-foreground'>Batch steps</p>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              Steps run in order; a failed step does not revert the others.
            </p>
            <ol className='mt-3 flex flex-col gap-2'>
              {batchSteps.map((step, i) => {
                const result = batchResults?.[i]
                return (
                  <li
                    key={i}
                    className='flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border px-3 py-2 text-sm'
                  >
                    <span className='font-mono text-muted-foreground'>#{i + 1}</span>
                    {nameFor(step.to) != null && (
                      <span className='font-semibold text-foreground'>{nameFor(step.to)}</span>
                    )}
                    <span className='break-all font-mono text-foreground'>{step.to}</span>
                    <span className='text-muted-foreground'>
                      value {showRawAmount ? `${step.value} wei` : formatNativeAmount(step.value, nativeSymbol)}
                    </span>
                    {result != null && (
                      <span className={cn('font-semibold', result.success ? 'text-primary' : 'text-destructive')}>
                        {result.success
                          ? 'succeeded'
                          : `failed${result.returnData !== '0x' ? ` (${result.returnData})` : ''}`}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {requestDetails.isExecuted ? (
          <div className='border-t border-border p-5 md:p-6'>
            <ExecutionOutcome
              outcome={executionOutcome}
              dateExecuted={requestDetails.dateExecuted}
              valueLabel={hasValue ? formatNativeAmount(requestDetails.request.value, nativeSymbol) : undefined}
              targetLabel={targetLabel}
              multiSigAddress={requestDetails.multiSigAddress}
              executionTxHash={requestDetails.request.executionTxHash}
              explorerUrl={explorerUrl}
              failedSteps={failedSteps}
              totalSteps={batchSteps?.length}
            />
          </div>
        ) : (
          <Fragment>
            <div className='flex flex-col gap-6 border-t border-border p-5 md:p-6'>
              {isExpired && (
                <Callout>
                  This request&apos;s signatures expired on {new Date(Number(validUntil) * 1000).toLocaleString()}. The
                  wallet refuses them (SignatureExpired). Reset the signatures and collect them again with a new
                  deadline.
                </Callout>
              )}
              {thresholdReached && !isExpired && (
                <ActionRow
                  title='Execute this request'
                  hint={preflightBlocked ? undefined : 'Enough approvals are collected.'}
                >
                  {preflightBlocked ? (
                    <Callout>
                      The wallet rejects the collected approvals (owners may have changed or the nonce moved). Reset the
                      signatures and collect them again.
                    </Callout>
                  ) : (
                    <ExecuteRequest
                      multiSigAddress={requestDetails.multiSigAddress}
                      args={requestDetails.request}
                      requestDetails={requestDetails}
                      existingRequestId={requestDetails.id}
                    />
                  )}
                </ActionRow>
              )}
              {modern && !isExpired && txHash != null && (
                <ScheduledExecutionPanel
                  multiSigAddress={requestDetails.multiSigAddress}
                  request={requestDetails}
                  txHash={txHash}
                  thresholdReached={thresholdReached}
                />
              )}
              <ActionRow
                title='Sign this request'
                hint={hasSigned || hasApproved ? undefined : 'Off-chain signature, no gas. Saved for the other owners.'}
              >
                {hasSigned ? (
                  <span className='text-sm font-semibold text-primary'>You already signed this request</span>
                ) : hasApproved ? (
                  <span className='text-sm text-muted-foreground'>
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
              </ActionRow>
              {supportsHybrid && txHash != null && !hasApproved && !hasSigned && (
                <ActionRow title='Or approve on-chain' hint='Sends a transaction from your wallet, so it costs gas.'>
                  <ApproveRequest
                    multiSigAddress={requestDetails.multiSigAddress}
                    txHash={txHash}
                    onApproved={() => refetchApprovals()}
                  />
                </ActionRow>
              )}
              {modern && txHash != null && hasApproved && (
                <ActionRow title='Withdraw your approval'>
                  <RevokeApproval
                    multiSigAddress={requestDetails.multiSigAddress}
                    txHash={txHash}
                    onRevoked={() => refetchApprovals()}
                  />
                </ActionRow>
              )}
            </div>

            <div className='flex flex-col gap-6 border-t border-border bg-muted/20 p-5 md:p-6'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Manage</p>
              <ActionRow title='Clear signatures' hint='Removes every collected signature so owners sign again.'>
                <Button variant='outline' onClick={() => setIsReset(true)}>
                  Reset signatures
                </Button>
              </ActionRow>
              {isOwner && !requestDetails.isCancelled && (
                <ActionRow
                  title='Cancel this request'
                  hint='Marks it inactive and wipes signatures on later-nonce requests in the queue.'
                >
                  <CancelRequestButton
                    multiSigRequestId={multiSigRequestId}
                    existingRequestId={multiSigRequestId}
                    description={requestDetails.description}
                  />
                </ActionRow>
              )}
              {!isOwner && (
                <p className='text-sm text-muted-foreground'>Only owners of this wallet can cancel this request.</p>
              )}
              <ActionRow title='Delete this request' hint='Removes it from the queue for every owner.'>
                <Button variant='destructive' onClick={() => setIsDeleted(true)}>
                  Delete
                </Button>
              </ActionRow>
            </div>
          </Fragment>
        )}
      </section>

    </Fragment>
  )
}

export default MultiSigRequestDetail
