import React from 'react'
import { PenLineIcon, PlayIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { InboxItem } from '../../hooks/useInbox'
import useNavigateOnChain from '../../hooks/useNavigateOnChain'
import { isUserOp } from '../../lib/api/effectiveNonce'
import { formatRequestDate } from '../../utils/requestDate'

export interface InboxSectionProps {
  title: string
  items: InboxItem[]
  emptyText: string
}

const ACTION = {
  sign: { label: 'Review & sign', icon: PenLineIcon },
  execute: { label: 'Review & execute', icon: PlayIcon },
  waiting: { label: 'Open', icon: null }
} as const

// One group of the inbox ("Needs your signature", ...). Each row opens the
// request page, where signing and executing happen with the on-chain checks.
const InboxSection: React.FC<InboxSectionProps> = ({ title, items, emptyText }) => {
  const navigate = useNavigateOnChain()
  return (
    <section className='overflow-hidden rounded-xl border border-border bg-card'>
      <div className='flex items-center justify-between gap-3 border-b border-border px-5 py-3'>
        <h2 className='text-base font-semibold text-foreground'>{title}</h2>
        <span
          className={cn(
            'rounded-full px-1.5 font-mono text-[10px] font-semibold leading-[18px]',
            items.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}
        >
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className='px-5 py-4 text-sm text-muted-foreground'>{emptyText}</p>
      ) : (
        <ul className='divide-y divide-border'>
          {items.map(({ request, wallet, status }) => {
            const action = ACTION[status]
            const signed = Math.min(request.signatures.length, wallet.threshold)
            const submitted = formatRequestDate(request.dateSubmitted)
            const pinned = request.txnNonce ?? request.request?.txnNonce ?? null
            return (
              <li key={request.id}>
                <button
                  type='button'
                  onClick={() => navigate(`/request/${request.id}`, wallet.chainId)}
                  className='flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/40'
                >
                  {/* Only a pinned nonce or a UserOp says something the row order does not */}
                  {(isUserOp(request) || pinned != null) && (
                    <span
                      className='shrink-0 rounded-md bg-muted px-1.5 py-1 text-center font-mono text-xs text-muted-foreground'
                      title={isUserOp(request) ? 'ERC-4337 UserOp: uses the EntryPoint nonce' : 'Pinned to this nonce'}
                    >
                      {isUserOp(request) ? '4337' : `#${pinned}`}
                    </span>
                  )}
                  <span className='flex min-w-0 flex-1 basis-40 flex-col gap-0.5'>
                    <span className='truncate text-sm font-semibold text-foreground'>{request.description}</span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {wallet.name || 'Multisig'} · {request.signatures.length} of {wallet.threshold} signature
                      {wallet.threshold === 1 ? '' : 's'} collected
                      {submitted != null && ` — submitted ${submitted}`}
                    </span>
                  </span>
                  <span className='flex w-16 shrink-0 gap-1' aria-hidden>
                    {Array.from({ length: wallet.threshold }, (_, i) => (
                      <span key={i} className={cn('h-1 flex-1 rounded-full', i < signed ? 'bg-primary' : 'bg-muted')} />
                    ))}
                  </span>
                  <span
                    className={cn(
                      'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-semibold',
                      status === 'waiting'
                        ? 'border border-border text-foreground'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    {action.icon != null && <action.icon className='h-3.5 w-3.5' />}
                    {action.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default InboxSection
