import React, { Fragment, useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'

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
    <div className='flex flex-col gap-4'>
      <h3 className='pb-2 text-2xl font-bold text-foreground'>Wallets you created</h3>
      {isLoading && <p className='text-sm text-muted-foreground'>Looking up the factory registry...</p>}
      {!isLoading && total === 0 && (
        <p className='text-sm text-muted-foreground'>
          No wallets created by {address.slice(0, 8)}... were found on this factory.
        </p>
      )}
      {discovered.map((wallet) => (
        <Fragment key={wallet.address}>
          <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-4'>
            <div className='flex flex-col'>
              <span className='font-semibold text-foreground'>
                {wallet.name || 'Unnamed'}{' '}
                <span className='rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground'>
                  {wallet.walletType === 'extended' ? 'Extended' : 'Simple'}
                </span>
              </span>
              <span className='text-xs text-muted-foreground'>{wallet.address}</span>
              <span className='text-xs text-muted-foreground'>
                {wallet.threshold} of {wallet.ownerCount} owners required
              </span>
            </div>
            {wallet.alreadyImported ? (
              <span className='text-sm text-green-600 dark:text-green-400'>Imported</span>
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
