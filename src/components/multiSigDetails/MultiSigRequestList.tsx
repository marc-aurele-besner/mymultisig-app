import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LoadingDots } from '@/components/ui/loading-dots'
import { AddIcon } from '../icons/ChakraIcons'
import CascadeBanner from './CascadeBanner'
import { MultiSigOnChainData, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useMultiSigRequests from '../../hooks/useMultiSigRequests'
import useRequestQueue from '../../hooks/useRequestQueue'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigRequestListProps {
  multiSigAddress: `0x${string}`
  multiSigDetails: MultiSigOnChainData
}

// One row. Hoisted so it can call useRequestQueue (a hook) at the top
// level — calling hooks inside .map() callbacks violates React's rules
// of hooks. The parent passes the already-sorted list and the row picks
// out its own position.
const RequestRow: React.FC<{
  request: MultiSigTransactionRequest
  index: number
  threshold: number
  requests: MultiSigTransactionRequest[]
  walletNonce: number | null
  onSelect: (id: string) => void
}> = ({ request, index, threshold, requests, walletNonce, onSelect }) => {
  const queue = useRequestQueue(requests, request.id, walletNonce)
  const signaturesShown = Math.min(request.signatures.length, threshold)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04, ease: 'easeOut' }}
      className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted/30'
    >
      <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='truncate text-sm font-semibold text-foreground'>{request.description}</span>
          {queue.isNext && (
            <span className='rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground'>
              Next
            </span>
          )}
          {queue.position > 0 && queue.total > 0 && !request.isExecuted && !request.isCancelled && (
            <span className='text-[10px] font-mono text-muted-foreground'>
              #{queue.position} of {queue.total}
            </span>
          )}
        </div>
        <span className='text-xs text-muted-foreground'>
          {request.isExecuted
            ? 'Executed'
            : request.isCancelled
              ? `Cancelled${request.dateCancelled !== '' ? ` on ${new Date(request.dateCancelled).toLocaleDateString()}` : ''}`
              : `${request.signatures.length} of ${threshold} signature${
                  threshold === 1 ? '' : 's'
                } collected`}
          {!request.isCancelled &&
            request.dateSubmitted !== '' &&
            ` — submitted ${new Date(Number(request.dateSubmitted)).toLocaleDateString()}`}
        </span>
        {!request.isExecuted && !request.isCancelled && (
          <div className='flex max-w-40 gap-1' aria-hidden>
            {Array.from({ length: threshold }, (_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  i < signaturesShown ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <Button asChild variant='outline' size='sm'>
        <Link href={`/request/${request.id}`} onClick={() => onSelect(request.id)}>
          Open
        </Link>
      </Button>
    </motion.div>
  )
}

const MultiSigRequestList: React.FC<MultiSigRequestListProps> = ({ multiSigAddress, multiSigDetails }) => {
  const { requests, walletNonce, isLoading, isError, refetch } = useMultiSigRequests(multiSigAddress)
  const { setSelectedMultiSigTransactionRequest } = useMultiSigs()

  if (multiSigDetails == null) return null

  if (isError) {
    return (
      <div className='flex w-full flex-col items-center gap-3 rounded-xl border border-destructive bg-destructive/10 p-6'>
        <p className='text-sm text-destructive'>The transaction requests could not be loaded.</p>
        <Button variant='outline' onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  if (requests == null || isLoading) {
    return (
      <div className='flex w-full items-center justify-center rounded-xl border border-border bg-muted/30 p-6'>
        <LoadingDots label='Loading requests...' />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className='flex w-full flex-col items-start gap-4 rounded-xl border border-dashed border-border p-6 md:p-8'>
        <div>
          <p className='text-base font-semibold text-foreground'>No requests yet</p>
          <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
            Transaction requests proposed for this wallet will show up here, along with their signature progress.
            Requests need {multiSigDetails.threshold} owner signature{multiSigDetails.threshold === 1 ? '' : 's'} before
            they can execute.
          </p>
        </div>
        <Button asChild className='gap-2'>
          <Link href={`/multisig/${multiSigAddress}/buildRequest`}>
            <AddIcon className='h-4 w-4' />
            Build the first request
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='flex w-full flex-col gap-2'>
      <CascadeBanner />
      {requests.map((request, index) => (
        <RequestRow
          key={request.id}
          request={request}
          index={index}
          threshold={multiSigDetails.threshold}
          requests={requests}
          walletNonce={walletNonce}
          onSelect={setSelectedMultiSigTransactionRequest}
        />
      ))}
    </div>
  )
}

export default MultiSigRequestList
