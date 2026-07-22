import React, { Fragment } from 'react'
import Link from 'next/link'
import { useAccount, useChainId, useChains } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import SubmitUserOpRequest from '../buttons/SubmitUserOpRequest'
import SignUserOp from '../buttons/SignUserOp'
import ApproveUserOpRequest from '../buttons/ApproveUserOpRequest'
import RevokeUserOpApproval from '../buttons/RevokeUserOpApproval'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useAdvancedFeatures from '../../hooks/useAdvancedFeatures'
import useEntryPointNonce from '../../hooks/useEntryPointNonce'
import useUserOpApprovalState from '../../hooks/useUserOpApprovalState'
import useBundlerConfig from '../../states/bundlerConfig'
import { MultiSigTransactionRequest } from '../../models/MultiSigs'

interface UserOpRequestCardProps {
  request: MultiSigTransactionRequest
  threshold: number
  onDelete: () => void
  onReset: () => void
}

// Dedicated card for a UserOp request. The standard request detail view
// already covers the multisig path; this card mirrors its layout but uses
// personal_sign votes, on-chain approveHash(userOpSigningHash), and the
// bundler-submit flow.
const UserOpRequestCard: React.FC<UserOpRequestCardProps> = ({ request, threshold, onDelete, onReset }) => {
  const { address } = useAccount()
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const explorerUrl = chain?.blockExplorers?.default?.url
  const { multiSigDetails } = useMultiSigDetails(request.multiSigAddress, address || '0x')
  const { supportsAdvanced, entryPoint } = useAdvancedFeatures(request.multiSigAddress)
  const { nonce: entryPointNonce } = useEntryPointNonce(entryPoint, request.multiSigAddress)
  const userOpSigningHash = request.request.userOpSigningHash
  const { approvedOwners, refetchApprovals } = useUserOpApprovalState(request.multiSigAddress, userOpSigningHash)
  const getBundlerUrl = useBundlerConfig((s) => s.getBundlerUrl)
  const getPaymasterUrl = useBundlerConfig((s) => s.getPaymasterUrl)
  const cfgBundlerUrl = chainId != null ? getBundlerUrl(chainId) : undefined
  const cfgPaymasterUrl = chainId != null ? getPaymasterUrl(chainId) : undefined
  const bundlerUrl = request.request.bundlerUrl ?? cfgBundlerUrl
  const paymasterUrl = request.request.paymasterUrl ?? cfgPaymasterUrl

  const signerSet = new Set(request.ownerSigners.map((s) => s.toLowerCase()))
  const approverSet = new Set(approvedOwners.map((s) => s.toLowerCase()))
  const combined = new Set([...signerSet, ...approverSet])
  const hasSigned = address != null && signerSet.has(address.toLowerCase())
  const hasApproved = address != null && approverSet.has(address.toLowerCase())
  const thresholdReached = combined.size >= threshold
  const receipt = request.request.userOpReceipt

  const row = (label: string, value: React.ReactNode) => (
    <div key={label} className='flex flex-wrap items-center gap-2'>
      <span className='px-2 pt-2 text-xl font-bold text-foreground'>{label}</span>
      <span className='px-2 pt-2 text-lg font-bold text-foreground'>{value}</span>
    </div>
  )

  if (multiSigDetails == null) return null

  return (
    <Fragment>
      <div className='mt-4 rounded-lg border border-border p-4'>
        {row('Description', request.description)}
        {row('Submitted date', new Date(Number(request.dateSubmitted)).toLocaleDateString())}
        {row('Target', request.request.to)}
        <div className='flex flex-wrap items-start gap-2'>
          <span className='px-2 pt-2 text-xl font-bold text-foreground'>Data</span>
          <Textarea readOnly defaultValue={request.request.data} className='min-h-[80px] flex-1' />
        </div>
        {row('Value', request.request.value)}
        {row('Tx. Gas', request.request.txnGas)}
        {row('Mode', 'UserOp via bundler (ERC-4337)')}
        {supportsAdvanced && entryPoint != null && row('EntryPoint', entryPoint)}
        {entryPointNonce != null && row('EntryPoint nonce', entryPointNonce.toString())}
        {request.request.userOpHash != null && (
          <div className='flex flex-wrap items-start gap-2 px-2 pt-2'>
            <span className='text-xl font-bold text-foreground'>UserOp hash</span>
            <span className='break-all font-mono text-sm text-foreground'>{request.request.userOpHash}</span>
          </div>
        )}
        {userOpSigningHash != null && (
          <div className='flex flex-wrap items-start gap-2 px-2 pt-2'>
            <span className='text-xl font-bold text-foreground'>UserOp signing hash</span>
            <span className='break-all font-mono text-sm text-foreground'>{userOpSigningHash}</span>
          </div>
        )}
        {row(
          'Approvals / Threshold',
          `${combined.size} / ${threshold} (${signerSet.size} personal_sign, ${approverSet.size} on-chain)`
        )}
        {bundlerUrl != null && bundlerUrl !== '' && row('Bundler', bundlerUrl)}
        {paymasterUrl != null && paymasterUrl !== '' && row('Paymaster', paymasterUrl)}
        {receipt != null && (
          <Fragment>
            {row(
              'Bundled tx',
              <span>
                {explorerUrl != null ? (
                  <a
                    href={`${explorerUrl}/tx/${receipt.txHash}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='break-all font-mono text-sm text-foreground underline'
                  >
                    {receipt.txHash}
                  </a>
                ) : (
                  <span className='break-all font-mono text-sm text-foreground'>{receipt.txHash}</span>
                )}
              </span>
            )}
            {row(
              'Status',
              receipt.success ? 'success' : `failed${receipt.reason != null ? ` (${receipt.reason})` : ''}`
            )}
            {row('Block', receipt.blockNumber)}
          </Fragment>
        )}
        {request.isExecuted ? (
          <div className='px-2 pt-2 text-xl font-bold text-primary'>
            This UserOp request has been executed
            {request.dateExecuted != null && ` on ${new Date(request.dateExecuted).toLocaleDateString()}`}.
          </div>
        ) : (
          <Fragment>
            {thresholdReached && bundlerUrl != null && bundlerUrl !== '' && entryPoint != null && (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='px-2 pt-2 text-xl font-bold text-foreground'>Send to bundler</span>
                <SubmitUserOpRequest
                  wallet={request.multiSigAddress}
                  entryPoint={entryPoint}
                  bundlerUrl={bundlerUrl}
                  paymasterUrl={paymasterUrl}
                  walletVersion={multiSigDetails.version}
                  requestDetails={request}
                  existingRequestId={request.id}
                />
              </div>
            )}
            {!thresholdReached && (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='px-2 pt-2 text-xl font-bold text-foreground'>Sign this UserOp</span>
                {hasSigned ? (
                  <span className='px-2 pt-2 text-xl font-bold text-primary'>You already signed this UserOp</span>
                ) : hasApproved ? (
                  <span className='px-2 pt-2 text-lg font-bold text-muted-foreground'>
                    You approved on-chain; a signature would be a duplicate vote
                  </span>
                ) : entryPoint != null ? (
                  <SignUserOp
                    wallet={request.multiSigAddress}
                    entryPoint={entryPoint}
                    nonce={entryPointNonce}
                    bundlerUrl={bundlerUrl}
                    paymasterUrl={paymasterUrl}
                    description={request.description}
                    args={request.request}
                    requestDetails={request}
                    existingRequestId={request.id}
                  />
                ) : (
                  <span className='px-2 pt-2 text-lg text-muted-foreground'>
                    EntryPoint is unknown for this wallet — re-sync the wallet.
                  </span>
                )}
              </div>
            )}
            {userOpSigningHash != null && entryPoint != null && !hasApproved && !hasSigned && (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='px-2 pt-2 text-xl font-bold text-foreground'>Or approve on-chain</span>
                <ApproveUserOpRequest
                  multiSigAddress={request.multiSigAddress}
                  userOpSigningHash={userOpSigningHash}
                  onApproved={() => refetchApprovals()}
                />
              </div>
            )}
            {userOpSigningHash != null && hasApproved && (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='px-2 pt-2 text-xl font-bold text-foreground'>Withdraw your approval</span>
                <RevokeUserOpApproval
                  multiSigAddress={request.multiSigAddress}
                  userOpSigningHash={userOpSigningHash}
                  onRevoked={() => refetchApprovals()}
                />
              </div>
            )}
            <div className='flex flex-wrap items-center gap-2'>
              <span className='px-2 pt-2 text-xl font-bold text-foreground'>Reset signatures</span>
              <Button variant='outline' className='mx-2 mt-2' onClick={onReset}>
                Reset
              </Button>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='px-2 pt-2 text-xl font-bold text-foreground'>Delete this request</span>
              <Button variant='destructive' className='mx-2 mt-2' onClick={onDelete}>
                Delete
              </Button>
            </div>
          </Fragment>
        )}
      </div>
      <div className='flex justify-center'>
        <Button asChild className='m-4'>
          <Link href={`/multisig/${request.multiSigAddress}/requests`}>View a different request</Link>
        </Button>
      </div>
    </Fragment>
  )
}

export default UserOpRequestCard
