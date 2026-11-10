import React from 'react'
import { useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { ChevronRightIcon } from 'lucide-react'

import Identicon from '../common/Identicon'
import NetworkIcon from '../icons/NetworkIcon'
import { MultiSig } from '../../models/MultiSigs'
import truncateAddress from '../../utils/truncateAddress'

export interface MultiSigRowProps {
  multiSig: MultiSig
  // Live requests in its queue.
  pending: number
  // The connected account is not in the stored owner list.
  viewOnly: boolean
  onOpen: () => void
}

// One saved multisig in the "My multisigs" list. Everything shown comes from
// the stored record plus a balance read on the wallet's own chain, so wallets
// on other networks list fully without switching to them.
const MultiSigRow: React.FC<MultiSigRowProps> = ({ multiSig, pending, viewOnly, onOpen }) => {
  const { data: balance } = useBalance({ address: multiSig.address, chainId: multiSig.chainId })

  return (
    <button
      type='button'
      onClick={onOpen}
      className='group flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 text-left transition-colors hover:bg-muted/40'
    >
      <Identicon value={multiSig.address} size={36} className='rounded-lg' />
      <span className='flex min-w-0 flex-1 basis-48 flex-col gap-0.5'>
        <span className='flex flex-wrap items-center gap-2'>
          <span className='truncate text-sm font-semibold text-foreground'>{multiSig.name || 'Multisig'}</span>
          {multiSig.version !== '' && (
            <span className='rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground'>
              v{multiSig.version}
            </span>
          )}
          {viewOnly && (
            <span className='rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground'>
              view only
            </span>
          )}
        </span>
        <span className='font-mono text-xs text-muted-foreground'>{truncateAddress(multiSig.address)}</span>
      </span>

      <span className='flex w-32 shrink-0 items-center gap-1.5 text-sm text-muted-foreground'>
        <NetworkIcon chainId={multiSig.chainId} name={multiSig.chainName} size={16} />
        <span className='truncate'>{multiSig.chainName}</span>
      </span>

      <span className='w-16 shrink-0 font-mono text-xs text-muted-foreground'>
        {multiSig.threshold} of {multiSig.ownerCount}
      </span>

      <span className='w-24 shrink-0'>
        {pending > 0 ? (
          <span className='rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[11px] text-primary'>
            {pending} pending
          </span>
        ) : (
          <span className='text-xs text-muted-foreground'>queue clear</span>
        )}
      </span>

      <span className='w-28 shrink-0 text-right font-mono text-sm text-foreground'>
        {balance != null
          ? `${Number(formatEther(balance.value)).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${balance.symbol}`
          : '…'}
      </span>

      <ChevronRightIcon className='h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary' />
    </button>
  )
}

export default MultiSigRow
