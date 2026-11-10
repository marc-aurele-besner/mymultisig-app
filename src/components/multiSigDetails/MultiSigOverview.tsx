import React from 'react'
import Link from 'next/link'
import { useAccount, useBalance, useChainId, useChains } from 'wagmi'
import { formatEther } from 'viem'
import { ListIcon, PenLineIcon, PlayIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingDots } from '@/components/ui/loading-dots'
import { cn } from '@/lib/utils'
import { CoinsIcon } from '../icons/ChakraIcons'

import AddressRow from '../common/AddressRow'
import SectionCard from '../common/SectionCard'
import { ActivityEntryRow } from './MultiSigActivityFeed'
import RequestLifecycle from './RequestLifecycle'
import FundMultiSigModal from '../modals/FundMultiSigModal'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useMultiSigRequests from '../../hooks/useMultiSigRequests'
import useMultiSigActivity from '../../hooks/useMultiSigActivity'
import useAdminEventSync from '../../hooks/useAdminEventSync'
import useMultiSigs from '../../states/multiSigs'
import { useAddressLabels } from '../../states/addressBook'
import { EOL_NONCE_THRESHOLD } from '../../constants/limits'
import { MultiSigTransactionRequest } from '../../models/MultiSigs'
import { walletHref } from '../shell/navigation'

interface MultiSigOverviewProps {
  multiSigAddress: `0x${string}`
}

const RECENT_ACTIVITY_COUNT = 5

// A tile can carry the action that belongs to its stat (e.g. Fund on Balance)
// or link to the tab that details it, so the overview needs no separate
// button row duplicating the navigation.
const StatTile: React.FC<{
  label: string
  value: React.ReactNode
  hint?: string
  action?: React.ReactNode
  href?: string
}> = ({ label, value, hint, action, href }) => {
  const content = (
    <>
      <div className='flex items-start justify-between gap-2'>
        <span className='font-mono text-[11px] uppercase tracking-wider text-muted-foreground'>{label}</span>
        {action}
      </div>
      <span className='font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl'>{value}</span>
      {hint != null && <span className='text-xs text-muted-foreground'>{hint}</span>}
    </>
  )
  const tileClass = 'flex flex-col gap-1 rounded-xl border border-border bg-card p-4'
  if (href != null)
    return (
      <Link
        href={href}
        className={cn(
          tileClass,
          'transition-[border-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_8px_24px_-16px] hover:shadow-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
        )}
      >
        {content}
      </Link>
    )
  return <div className={tileClass}>{content}</div>
}

// The request at the front of the queue and the one thing to do about it.
// The list arrives server-sorted, so the first live row is the next one.
const NextUp: React.FC<{
  multiSigAddress: `0x${string}`
  requests: MultiSigTransactionRequest[] | null
  isError: boolean
  threshold: number
  isOwner: boolean
  account: string | undefined
}> = ({ multiSigAddress, requests, isError, threshold, isOwner, account }) => {
  if (isError)
    return (
      <div className='rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground'>
        The request queue could not be loaded.{' '}
        <Link href={walletHref(multiSigAddress, 'requests')} className='text-primary underline-offset-4 hover:underline'>
          Open the queue
        </Link>
      </div>
    )
  if (requests == null)
    return (
      <div className='flex items-center rounded-xl border border-border bg-card p-5'>
        <LoadingDots size='sm' label='Loading requests...' />
      </div>
    )

  const live = requests.filter((r) => r.isActive && !r.isExecuted && !r.isCancelled)
  const next = live[0]

  if (next == null)
    return (
      <div className='flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-5 md:p-6'>
        <span className='grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground'>
          <ListIcon className='h-5 w-5' />
        </span>
        <div>
          <h3 className='text-base font-semibold text-foreground'>The queue is clear</h3>
          <p className='mt-1 max-w-md text-sm leading-relaxed text-muted-foreground'>
            Nothing is waiting for signatures. Propose a transfer or a contract call and it will show up here.
          </p>
        </div>
        <Button asChild className='gap-2'>
          <Link href={walletHref(multiSigAddress, 'buildRequest')}>
            <PlusIcon className='h-4 w-4' />
            Build a request
          </Link>
        </Button>
      </div>
    )

  const me = account?.toLowerCase()
  const signed = next.signatures.length
  const reached = signed >= threshold
  const iSigned = me != null && (next.ownerSigners ?? []).some((signer) => signer.toLowerCase() === me)
  const myTurn = isOwner && !reached && !iSigned
  const remaining = Math.max(threshold - signed, 0)
  const message = reached
    ? 'Every signature is in. Any owner can execute it; the executor pays gas.'
    : myTurn
      ? 'Waiting for your signature. Signing is free.'
      : `Waiting on ${remaining} more owner signature${remaining === 1 ? '' : 's'}.`

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-primary/40 bg-gradient-to-b from-primary/10 to-transparent p-5 md:p-6'>
      <div className='flex items-center justify-between gap-3'>
        <span className='font-mono text-[11px] uppercase tracking-wider text-primary'>Next up</span>
        <span className='font-mono text-xs text-muted-foreground'>
          {live.length} in the queue
        </span>
      </div>
      <div>
        <h3 className='font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>
          {next.description}
        </h3>
        <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
      </div>
      <RequestLifecycle signatures={signed} threshold={threshold} />
      <div className='flex flex-wrap gap-2'>
        <Button asChild className='gap-2'>
          <Link href={`/request/${next.id}`}>
            {reached ? <PlayIcon className='h-4 w-4' /> : myTurn ? <PenLineIcon className='h-4 w-4' /> : null}
            {reached ? 'Review & execute' : myTurn ? 'Review & sign' : 'Open request'}
          </Link>
        </Button>
        <Button asChild variant='outline'>
          <Link href={walletHref(multiSigAddress, 'requests')}>Whole queue ({live.length})</Link>
        </Button>
      </div>
    </div>
  )
}

// Dashboard for the Overview tab: wallet vitals, what the queue needs next,
// owners, and a preview of the latest on-chain activity.
const MultiSigOverview: React.FC<MultiSigOverviewProps> = ({ multiSigAddress }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const { multiSigDetails, data, onChainOwners, refetchOwners } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { data: balance } = useBalance({ address: multiSigAddress, chainId: chain?.id })
  const { requests, isError: requestsError } = useMultiSigRequests(multiSigAddress)
  // A light scan (fewer RPC windows) is enough for a preview; the Activity tab
  // digs deeper.
  const { entries, isLoading: activityLoading } = useMultiSigActivity(multiSigAddress, {
    maxChunksPerLoad: 4,
    targetEntries: RECENT_ACTIVITY_COUNT
  })
  const { multiSigs } = useMultiSigs()
  const { labelFor } = useAddressLabels(chain?.id)
  const [fundModalOpen, setFundModalOpen] = React.useState(false)
  useAdminEventSync(multiSigAddress, refetchOwners)

  const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
  // 0.5.0 wallets report the authoritative list via getOwners(); older
  // deployments fall back to the locally tracked one.
  const owners = onChainOwners ?? stored?.owners ?? []
  const explorerUrl = chain?.blockExplorers?.default?.url

  if (multiSigDetails == null)
    return (
      <div className='flex items-center justify-center p-6'>
        <LoadingDots label='Reading the multisig contract...' />
      </div>
    )

  const nonceRaw = data != null ? BigInt(data[4] as bigint) : 0n
  const nearEndOfLife = nonceRaw >= EOL_NONCE_THRESHOLD
  const isOwner = data != null ? Boolean(data[5]) : false
  const recentEntries = entries.slice(0, RECENT_ACTIVITY_COUNT)
  const pendingRequests =
    requests != null ? requests.filter((r) => r.isActive && !r.isExecuted && !r.isCancelled).length : null

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
          href={`/multisig/${multiSigAddress}/settings`}
        />
        <StatTile
          label='Pending requests'
          value={requestsError ? '—' : (pendingRequests ?? '...')}
          hint={requestsError ? 'could not load' : `${multiSigDetails.nonce} executed so far`}
          href={`/multisig/${multiSigAddress}/requests`}
        />
        <StatTile
          label='Balance'
          value={
            balance != null
              ? `${Number(formatEther(balance.value)).toLocaleString(undefined, { maximumFractionDigits: 5 })}`
              : '...'
          }
          hint={balance?.symbol}
          action={
            <Button
              variant='outline'
              size='sm'
              className='-mr-1 -mt-1 h-7 gap-1.5 px-2 text-xs'
              onClick={() => setFundModalOpen(true)}
            >
              <CoinsIcon className='h-3.5 w-3.5' />
              Fund
            </Button>
          }
        />
      </div>
      <FundMultiSigModal multiSigAddress={multiSigAddress} open={fundModalOpen} onOpenChange={setFundModalOpen} />

      <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'>
        <div className='flex min-w-0 flex-col gap-4'>
          <NextUp
            multiSigAddress={multiSigAddress}
            requests={requests}
            isError={requestsError}
            threshold={multiSigDetails.threshold}
            isOwner={isOwner}
            account={address}
          />

          <SectionCard
            title='Recent activity'
            action={
              <Link
                href={`/multisig/${multiSigAddress}/activity`}
                className='text-sm text-primary transition-colors hover:underline'
              >
                View all
              </Link>
            }
          >
            <div className='flex flex-col gap-2'>
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
                <LoadingDots size='sm' label='Scanning recent blocks...' />
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No recent on-chain activity found. Executions, funds received, and owner changes will show up here.
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title='Owners'
          flush
          action={
            <Link
              href={`/multisig/${multiSigAddress}/settings`}
              className='text-sm text-primary transition-colors hover:underline'
            >
              Manage
            </Link>
          }
        >
          {owners.length > 0 ? (
            <ul className='divide-y divide-border'>
              {owners.map((owner) => (
                <li key={owner} className='px-5 py-3'>
                  <AddressRow
                    address={owner}
                    label={labelFor(owner)}
                    isYou={address != null && owner.toLowerCase() === address.toLowerCase()}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className='p-5 text-sm text-muted-foreground'>
              {multiSigDetails.ownerCount} owner{multiSigDetails.ownerCount === 1 ? ' is' : 's are'} registered
              on-chain. Wallets deployed before 0.5.0 store owners as a bare mapping (no getOwners()), so the app can
              only list addresses it has seen; owner operations fill this in over time.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

export default MultiSigOverview
