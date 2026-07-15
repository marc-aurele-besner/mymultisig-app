import React, { Fragment, useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { LoadingDots } from '@/components/ui/loading-dots'

import ImportConfirmationCard from '../cards/ImportConfirmationCard'
import useFactoryDiscovery from '../../hooks/useFactoryDiscovery'
import { MultiSigFactory } from '../../models/MultiSigs'

interface DiscoverMultiSigsProps {
  factory: MultiSigFactory
}

// Lists every wallet the connected account created through the factory
// (on-chain bookkeeping), with one-click import into the local list.
const DiscoverMultiSigs: React.FC<DiscoverMultiSigsProps> = ({ factory }) => {
  const { address } = useAccount()
  const { discovered, total, isLoading } = useFactoryDiscovery(factory.address)
  const [importing, setImporting] = useState<`0x${string}` | null>(null)

  if (address == null) return null

  return (
    <div className='flex flex-col gap-4 border-t border-border pt-8'>
      <div>
        <h3 className='text-sm font-semibold text-foreground'>Wallets you created</h3>
        <p className='mt-1 text-sm text-muted-foreground'>
          The factory keeps an on-chain record of every wallet an address deploys — anything missing from this
          browser shows up here.
        </p>
      </div>
      {isLoading && <LoadingDots label='Looking up the factory registry...' />}
      {!isLoading && total === 0 && (
        <p className='text-sm text-muted-foreground'>
          No wallets created by <span className='font-mono'>{address.slice(0, 8)}…</span> were found on this factory.
        </p>
      )}
      {discovered.map((wallet) => (
        <Fragment key={wallet.address}>
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary/40'>
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='flex items-center gap-2 font-semibold text-foreground'>
                {wallet.name || 'Unnamed'}
                <span className='rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary'>
                  {wallet.walletType === 'extended' ? 'Extended' : 'Simple'}
                </span>
                <span className='rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-normal text-muted-foreground'>
                  {wallet.threshold} of {wallet.ownerCount}
                </span>
              </span>
              <span className='break-all font-mono text-xs text-muted-foreground'>{wallet.address}</span>
            </div>
            {wallet.alreadyImported ? (
              <span className='font-mono text-xs text-primary'>Imported</span>
            ) : (
              <Button variant='outline' onClick={() => setImporting(wallet.address)}>
                Import
              </Button>
            )}
          </div>
          {importing === wallet.address && (
            <ImportConfirmationCard
              factoryAddress={factory.address}
              multiSigAddress={wallet.address}
              address={address}
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}

export default DiscoverMultiSigs
