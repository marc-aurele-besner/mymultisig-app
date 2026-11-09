import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { describeWalletError, isUserRejection } from '../../utils/walletError'

interface WalletActionNoticeProps {
  error: unknown
  // What the owner was doing, e.g. "execution" or "signature"; used in the copy.
  action?: string
  onDismiss?: () => void
  className?: string
}

// Inline feedback under a wallet action button. Dismissing the wallet prompt
// is a normal choice, so it reads as a quiet note; any other failure shows
// the decoded reason in one short line instead of a raw error dump.
const WalletActionNotice: React.FC<WalletActionNoticeProps> = ({ error, action = 'request', onDismiss, className }) => {
  const rejected = isUserRejection(error)
  const title = rejected ? 'Cancelled in your wallet' : `The ${action} failed`
  const detail = rejected ? 'Nothing was sent. Try again when you are ready.' : describeWalletError(error)

  return (
    <div
      role={rejected ? 'status' : 'alert'}
      className={cn(
        'flex w-full max-w-sm items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm',
        rejected ? 'border-border bg-muted/40' : 'border-destructive/40 bg-destructive/10',
        className
      )}
    >
      <div className='min-w-0 flex-1'>
        <p className={cn('font-medium', rejected ? 'text-foreground' : 'text-destructive')}>{title}</p>
        <p className='mt-0.5 break-words text-xs text-muted-foreground'>{detail}</p>
      </div>
      {onDismiss != null && (
        <button
          type='button'
          onClick={onDismiss}
          aria-label='Dismiss'
          className='-mr-1 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
        >
          <X className='size-3.5' />
        </button>
      )}
    </div>
  )
}

export default WalletActionNotice
