import React, { useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import truncateAddress from '../../utils/truncateAddress'
import Identicon from './Identicon'

export interface AddressRowProps {
  address: string
  // Address-book label, shown before the address.
  label?: string | null
  // Marks the connected account.
  isYou?: boolean
  // Show the whole address from `md` up (always shortened below).
  full?: boolean
  // Extra content at the end of the row (badges, actions).
  children?: React.ReactNode
  className?: string
}

// One address, readable: an identicon, its label when known, the address,
// a "You" chip for the connected account and a copy button.
const AddressRow: React.FC<AddressRowProps> = ({ address, label, isYou = false, full = false, children, className }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied; the address stays selectable.
    }
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <Identicon value={address} size={28} />
      <div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5'>
        {label != null && label !== '' && (
          <span className='truncate text-sm font-semibold text-foreground'>{label}</span>
        )}
        <span className={cn('font-mono text-xs', label ? 'text-muted-foreground' : 'text-foreground')}>
          {full ? (
            <>
              <span className='hidden break-all md:inline'>{address}</span>
              <span className='md:hidden'>{truncateAddress(address)}</span>
            </>
          ) : (
            truncateAddress(address)
          )}
        </span>
        {isYou && (
          <span className='rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary'>You</span>
        )}
      </div>
      {children}
      <button
        type='button'
        onClick={copy}
        aria-label='Copy address'
        className='shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-primary'
      >
        {copied ? <CheckIcon className='h-3.5 w-3.5 text-primary' /> : <CopyIcon className='h-3.5 w-3.5' />}
      </button>
    </div>
  )
}

export default AddressRow
