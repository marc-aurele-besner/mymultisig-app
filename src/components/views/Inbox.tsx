import React from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { DownloadIcon, HelpCircleIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LoadingDots } from '@/components/ui/loading-dots'
import NetworkIcon from '../icons/NetworkIcon'
import GettingStartedChecklist from '../onboarding/GettingStartedChecklist'
import ProgressRing from '../onboarding/ProgressRing'
import ConnectedWallet from './ConnectedWallet'
import InboxSection from '../inbox/InboxSection'
import useActiveWallet from '../../hooks/useActiveWallet'
import useInbox from '../../hooks/useInbox'
import useNavigateOnChain from '../../hooks/useNavigateOnChain'
import useOnboarding from '../../hooks/useOnboarding'
import useOnboardingState from '../../states/onboarding'
import { walletHref } from '../shell/navigation'
import truncateAddress from '../../utils/truncateAddress'

const GettingStartedCard: React.FC = () => {
  const onboarding = useOnboarding()
  const { dismissed, setDismissed } = useOnboardingState()
  if (onboarding.isComplete || dismissed) return null
  return (
    <section className='flex flex-col gap-3 rounded-xl border border-primary/40 bg-primary/5 p-5'>
      <div className='flex items-center gap-3'>
        <ProgressRing done={onboarding.doneCount} total={onboarding.total} />
        <div className='flex min-w-0 flex-1 flex-col'>
          <h2 className='text-base font-semibold text-foreground'>Getting started</h2>
          <span className='text-xs text-muted-foreground'>
            A wallet is fully set up after these {onboarding.total} steps.
          </span>
        </div>
        <Button variant='ghost' size='sm' onClick={() => setDismissed(true)}>
          Hide
        </Button>
      </div>
      <GettingStartedChecklist steps={onboarding.steps} compact />
      <Link href='/get-started' className='text-xs text-primary underline-offset-4 hover:underline'>
        Open the full guide →
      </Link>
    </section>
  )
}

// Home for a connected wallet: everything waiting on the account across the
// multisigs saved in this browser, on every network.
const Inbox: React.FC = () => {
  const { address } = useAccount()
  const { wallet, wallets } = useActiveWallet()
  const { items, pendingByWallet, isLoading } = useInbox()
  const navigate = useNavigateOnChain()

  const toSign = items.filter((i) => i.status === 'sign')
  const toExecute = items.filter((i) => i.status === 'execute')
  const waiting = items.filter((i) => i.status === 'waiting')
  const needsYou = toSign.length + toExecute.length

  if (wallets.length === 0) {
    return (
      <div className='flex flex-col gap-8'>
        <header>
          <p className='mb-2 font-mono text-xs tracking-[0.2em] text-primary'>WELCOME</p>
          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
            Let’s set up your first multisig
          </h1>
          <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
            You are connected as <span className='font-mono'>{truncateAddress(address ?? '')}</span>. A multisig is a
            shared wallet: you choose the owners and how many must approve.
          </p>
        </header>
        <div className='grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'>
          <GettingStartedCard />
          <div className='flex flex-col gap-3'>
            {[
              {
                href: '/create-multisig',
                icon: PlusIcon,
                title: 'Create a multisig',
                text: 'Deploy a new shared wallet in one transaction.'
              },
              {
                href: '/import-multisig',
                icon: DownloadIcon,
                title: 'Import a multisig',
                text: 'Someone already created it? Add it by address.'
              },
              {
                href: '/docs/what-is-a-multisig',
                icon: HelpCircleIcon,
                title: 'What is a multisig?',
                text: 'A two-minute read before you start.'
              }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40'
              >
                <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted'>
                  <item.icon className='h-4 w-4' />
                </span>
                <span className='flex flex-col gap-0.5'>
                  <span className='text-sm font-semibold text-foreground'>{item.title}</span>
                  <span className='text-xs text-muted-foreground'>{item.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
        <ConnectedWallet />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='mb-2 font-mono text-xs tracking-[0.2em] text-primary'>INBOX</p>
          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
            {needsYou > 0
              ? `${needsYou} request${needsYou === 1 ? '' : 's'} need${needsYou === 1 ? 's' : ''} you`
              : 'You’re all caught up'}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Everything waiting on you across {wallets.length} multisig{wallets.length === 1 ? '' : 's'}, on every
            network.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {wallet != null && (
            <Button asChild className='gap-2'>
              <Link href={walletHref(wallet.address, 'buildRequest')}>
                <PlusIcon className='h-4 w-4' />
                New request
              </Link>
            </Button>
          )}
          <Button asChild variant='outline' className='gap-2'>
            <Link href='/create-multisig'>
              <PlusIcon className='h-4 w-4' />
              Create a multisig
            </Link>
          </Button>
          <Button asChild variant='outline' className='gap-2'>
            <Link href='/import-multisig'>
              <DownloadIcon className='h-4 w-4' />
              Import
            </Link>
          </Button>
        </div>
      </header>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'>
        <div className='flex min-w-0 flex-col gap-4'>
          {isLoading && items.length === 0 ? (
            <div className='flex items-center justify-center rounded-xl border border-border bg-card p-6'>
              <LoadingDots label='Loading requests...' />
            </div>
          ) : (
            <>
              <InboxSection title='Needs your signature' items={toSign} emptyText='Nothing to sign right now.' />
              <InboxSection
                title='Ready to execute'
                items={toExecute}
                emptyText='No request has reached its threshold yet.'
              />
              <InboxSection
                title='Waiting on other owners'
                items={waiting}
                emptyText='Nothing is waiting on others.'
              />
            </>
          )}
        </div>

        <div className='flex min-w-0 flex-col gap-4'>
          <GettingStartedCard />
          <section className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <h2 className='text-base font-semibold text-foreground'>Multisigs</h2>
              <Link href='/open-multisig' className='text-xs text-primary underline-offset-4 hover:underline'>
                View all
              </Link>
            </div>
            {wallets.map((item) => {
              const pending = pendingByWallet[item.address.toLowerCase()] ?? 0
              return (
                <button
                  key={`${item.chainId}:${item.address}`}
                  type='button'
                  onClick={() => navigate(walletHref(item.address), item.chainId)}
                  className='flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40'
                >
                  <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted'>
                    <NetworkIcon chainId={item.chainId} name={item.chainName} size={20} />
                  </span>
                  <span className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-semibold text-foreground'>{item.name || 'Multisig'}</span>
                    <span className='truncate font-mono text-xs text-muted-foreground'>
                      {truncateAddress(item.address)} · {item.threshold} of {item.ownerCount} · {item.chainName}
                    </span>
                  </span>
                  {pending > 0 ? (
                    <span className='rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[11px] text-primary'>
                      {pending} pending
                    </span>
                  ) : (
                    <span className='text-xs text-muted-foreground'>queue clear</span>
                  )}
                </button>
              )
            })}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Inbox
