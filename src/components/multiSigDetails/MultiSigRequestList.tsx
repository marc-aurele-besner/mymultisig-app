import React, { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LoadingDots } from '@/components/ui/loading-dots'
import { AddIcon } from '../icons/ChakraIcons'
import CascadeBanner from './CascadeBanner'
import { MultiSigOnChainData, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useMultiSigRequests from '../../hooks/useMultiSigRequests'
import useRequestQueue from '../../hooks/useRequestQueue'
import useMultiSigs from '../../states/multiSigs'
import { formatRequestDate } from '../../utils/requestDate'

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
  needsMe: boolean
  onSelect: (id: string) => void
}> = ({ request, index, threshold, requests, walletNonce, needsMe, onSelect }) => {
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
          {needsMe && (
            <span className='rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary'>
              Your signature
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
            ? request.isSuccessful
              ? 'Executed'
              : 'Executed — call failed, nothing sent'
            : request.isCancelled
              ? `Cancelled${formatRequestDate(request.dateCancelled) != null ? ` on ${formatRequestDate(request.dateCancelled)}` : ''}`
              : `${request.signatures.length} of ${threshold} signature${threshold === 1 ? '' : 's'} collected`}
          {!request.isCancelled &&
            formatRequestDate(request.dateSubmitted) != null &&
            ` — submitted ${formatRequestDate(request.dateSubmitted)}`}
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
      <Button asChild variant={needsMe ? 'default' : 'outline'} size='sm'>
        <Link href={`/request/${request.id}`} onClick={() => onSelect(request.id)}>
          {needsMe ? 'Review & sign' : 'Open'}
        </Link>
      </Button>
    </motion.div>
  )
}

type QueueFilter = 'all' | 'open' | 'history'

const FILTERS: { key: QueueFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'history', label: 'History' }
]

const isLive = (request: MultiSigTransactionRequest) =>
  request.isActive && !request.isExecuted && !request.isCancelled

const MultiSigRequestList: React.FC<MultiSigRequestListProps> = ({ multiSigAddress, multiSigDetails }) => {
  const { requests, walletNonce, isLoading, isError, refetch } = useMultiSigRequests(multiSigAddress)
  const { setSelectedMultiSigTransactionRequest } = useMultiSigs()
  const { address } = useAccount()
  const [filter, setFilter] = useState<QueueFilter>('all')

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

  const me = address?.toLowerCase()
  const isOwner = me != null && multiSigDetails.owners.some((owner) => owner.toLowerCase() === me)
  // Off-chain signatures only; an on-chain approval shows on the request page.
  const needsMe = (request: MultiSigTransactionRequest) =>
    isOwner &&
    isLive(request) &&
    request.signatures.length < multiSigDetails.threshold &&
    !(request.ownerSigners ?? []).some((signer) => signer.toLowerCase() === me)

  const counts: Record<QueueFilter, number> = {
    all: requests.length,
    open: requests.filter(isLive).length,
    history: requests.filter((request) => !isLive(request)).length
  }
  const visible = requests.filter(
    (request) => filter === 'all' || (filter === 'open' ? isLive(request) : !isLive(request))
  )

  return (
    <div className='flex w-full flex-col gap-3'>
      <CascadeBanner />
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div role='tablist' aria-label='Filter requests' className='flex gap-0.5 rounded-lg bg-muted p-0.5'>
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type='button'
              role='tab'
              aria-selected={filter === item.key}
              onClick={() => setFilter(item.key)}
              className={cn(
                'flex min-h-8 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors',
                filter === item.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
              <span className='font-mono text-xs font-normal'>{counts[item.key]}</span>
            </button>
          ))}
        </div>
        <span className='text-xs text-muted-foreground'>
          Requests execute in nonce order.
          {walletNonce != null && <span className='font-mono'> Wallet nonce {walletNonce}</span>}
        </span>
      </div>
      {visible.length === 0 && (
        <p className='rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground'>
          No requests in this view.
        </p>
      )}
      <div className='flex flex-col gap-2'>
        {visible.map((request, index) => (
          <RequestRow
            key={request.id}
            request={request}
            index={index}
            threshold={multiSigDetails.threshold}
            requests={requests}
            walletNonce={walletNonce}
            needsMe={needsMe(request)}
            onSelect={setSelectedMultiSigTransactionRequest}
          />
        ))}
      </div>
    </div>
  )
}

export default MultiSigRequestList
