import React from 'react'
import Link from 'next/link'
import { useAccount, useBalance, useChainId, useChains } from 'wagmi'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { AddIcon, CoinsIcon } from '../icons/ChakraIcons'

import { ActivityEntryRow } from './MultiSigActivityFeed'
import FundMultiSigModal from '../modals/FundMultiSigModal'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useMultiSigActivity from '../../hooks/useMultiSigActivity'
import useAdminEventSync from '../../hooks/useAdminEventSync'
import useMultiSigs from '../../states/multiSigs'
import { useAddressLabels } from '../../states/addressBook'
import { EOL_NONCE_THRESHOLD } from '../../constants/limits'

interface MultiSigOverviewProps {
  multiSigAddress: `0x${string}`
}

const RECENT_ACTIVITY_COUNT = 5

const StatTile: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className='flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-4'>
    <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{label}</span>
    <span className='text-2xl font-bold text-foreground'>{value}</span>
    {hint != null && <span className='text-xs text-muted-foreground'>{hint}</span>}
  </div>
)

// Dashboard for the Overview tab: wallet vitals, owners, and a preview of the
// latest on-chain activity. Building requests lives on its own tab.
const MultiSigOverview: React.FC<MultiSigOverviewProps> = ({ multiSigAddress }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const { multiSigDetails, data } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { data: balance } = useBalance({ address: multiSigAddress, chainId: chain?.id })
  // A light scan (fewer RPC windows) is enough for a preview; the Activity tab
  // digs deeper.
  const { entries, isLoading: activityLoading } = useMultiSigActivity(multiSigAddress, {
    maxChunksPerLoad: 4,
    targetEntries: RECENT_ACTIVITY_COUNT
  })
  const { multiSigs } = useMultiSigs()
  const { labelFor } = useAddressLabels(chain?.id)
  const [fundModalOpen, setFundModalOpen] = React.useState(false)
  useAdminEventSync(multiSigAddress)

  const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
  const owners = stored?.owners ?? []
  const explorerUrl = chain?.blockExplorers?.default?.url

  if (multiSigDetails == null)
    return (
      <div className='flex items-center justify-center gap-3 p-6'>
        <span className='h-3 w-3 animate-pulse rounded-full bg-primary' />
        <span className='text-sm text-muted-foreground'>Reading the multisig contract...</span>
      </div>
    )

  const nonceRaw = data != null ? BigInt(data[4] as bigint) : 0n
  const nearEndOfLife = nonceRaw >= EOL_NONCE_THRESHOLD
  const isOwner = data != null ? Boolean(data[5]) : false
  const recentEntries = entries.slice(0, RECENT_ACTIVITY_COUNT)

  return (
    <div className='flex w-full flex-col gap-6'>
      {nearEndOfLife && (
        <div className='w-full rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive'>
          This wallet is approaching its end of life: fewer than 1000 transaction nonces remain. Plan a migration to a
          new wallet.
        </div>
      )}

      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatTile
          label='Required signatures'
          value={`${multiSigDetails.threshold} of ${multiSigDetails.ownerCount}`}
          hint='to execute a transaction'
        />
        <StatTile
          label='Owners'
          value={multiSigDetails.ownerCount}
          hint={isOwner ? 'you are an owner' : 'you are not an owner'}
        />
        <StatTile label='Next nonce' value={multiSigDetails.nonce} />
        <StatTile
          label='Balance'
          value={
            balance != null
              ? `${Number(formatEther(balance.value)).toLocaleString(undefined, { maximumFractionDigits: 5 })}`
              : '...'
          }
          hint={balance?.symbol}
        />
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button size='lg' className='gap-2' asChild>
          <Link href={`/multisig/${multiSigAddress}/buildRequest`}>
            <AddIcon className='h-4 w-4' />
            Build a request
          </Link>
        </Button>
        <Button size='lg' variant='outline' asChild>
          <Link href={`/multisig/${multiSigAddress}/requests`}>Review pending requests</Link>
        </Button>
        <Button size='lg' variant='outline' className='gap-2' onClick={() => setFundModalOpen(true)}>
          <CoinsIcon className='h-4 w-4' />
          Fund wallet
        </Button>
      </div>
      <FundMultiSigModal multiSigAddress={multiSigAddress} open={fundModalOpen} onOpenChange={setFundModalOpen} />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <div className='flex flex-col gap-2 rounded-xl border border-border p-4'>
          <div className='flex items-baseline justify-between'>
            <h3 className='text-base font-semibold text-foreground'>Owners</h3>
            <Link
              href={`/multisig/${multiSigAddress}/settings`}
              className='text-sm text-primary transition-colors hover:underline'
            >
              Manage
            </Link>
          </div>
          {owners.length > 0 ? (
            owners.map((owner) => (
              <span key={owner} className='break-all font-mono text-xs text-foreground'>
                {owner}
                {labelFor(owner) != null && (
                  <span className='ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'>
                    {labelFor(owner)}
                  </span>
                )}
                {address != null && owner.toLowerCase() === address.toLowerCase() && (
                  <span className='ml-2 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground'>You</span>
                )}
              </span>
            ))
          ) : (
            <p className='text-sm text-muted-foreground'>
              {multiSigDetails.ownerCount} owner{multiSigDetails.ownerCount === 1 ? ' is' : 's are'} registered
              on-chain. The contract stores owners as a mapping, so the app can only list addresses it has seen; owner
              operations fill this in over time.
            </p>
          )}
        </div>

        <div className='flex flex-col gap-2 rounded-xl border border-border p-4'>
          <div className='flex items-baseline justify-between'>
            <h3 className='text-base font-semibold text-foreground'>Recent activity</h3>
            <Link
              href={`/multisig/${multiSigAddress}/activity`}
              className='text-sm text-primary transition-colors hover:underline'
            >
              View all
            </Link>
          </div>
          {recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <ActivityEntryRow
                key={entry.id}
                entry={entry}
                multiSigAddress={multiSigAddress}
                explorerUrl={explorerUrl}
                labelFor={labelFor}
              />
            ))
          ) : activityLoading ? (
            <div className='flex items-center gap-3 p-2'>
              <span className='h-2.5 w-2.5 animate-pulse rounded-full bg-primary' />
              <span className='text-sm text-muted-foreground'>Scanning recent blocks...</span>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No recent on-chain activity found. Executions and owner changes will show up here.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MultiSigOverview
