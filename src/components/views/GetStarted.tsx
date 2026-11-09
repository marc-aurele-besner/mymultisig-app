import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import GettingStartedChecklist from '../onboarding/GettingStartedChecklist'
import ProgressRing from '../onboarding/ProgressRing'
import useHasMounted from '../../hooks/useHasMounted'
import useOnboarding from '../../hooks/useOnboarding'
import useOnboardingState from '../../states/onboarding'

const GUIDES = [
  { href: '/docs/what-is-a-multisig', title: 'What is a multisig?' },
  { href: '/docs/create-a-multisig', title: 'Create a multisig' },
  { href: '/docs/propose-sign-execute', title: 'Propose, sign, and execute transactions' },
  { href: '/docs/import-a-multisig', title: 'Import an existing multisig' },
  { href: '/docs/ai-agents', title: 'Manage a multisig with AI agents' }
]

const LIFECYCLE = ['Proposed', 'Signed', 'Ready', 'Executed']

// The first-run path on one page: connect, sign in, create or import, fund,
// propose, execute, notifications. Progress is derived from real state, so
// the page can be left and reopened at any time.
const GetStarted: React.FC = () => {
  const hasMounted = useHasMounted()
  const onboarding = useOnboarding()
  const { dismissed, setDismissed } = useOnboardingState()

  return (
    <div className='flex flex-col gap-8'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='mb-2 font-mono text-xs tracking-[0.2em] text-primary'>GET STARTED</p>
          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
            {hasMounted && onboarding.isComplete
              ? 'You’re fully set up'
              : 'From zero to your first executed transaction'}
          </h1>
          <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
            Seven steps. Each one says what happens and why. You can leave and come back; progress is tracked for you.
          </p>
        </div>
        {hasMounted && <ProgressRing done={onboarding.doneCount} total={onboarding.total} size={56} />}
      </header>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'>
        <section className='rounded-xl border border-border bg-card p-5'>
          {hasMounted && <GettingStartedChecklist steps={onboarding.steps} />}
          {hasMounted && dismissed && !onboarding.isComplete && (
            <div className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4'>
              <span className='text-xs text-muted-foreground'>The checklist is hidden from the sidebar and inbox.</span>
              <Button variant='outline' size='sm' onClick={() => setDismissed(false)}>
                Show it again
              </Button>
            </div>
          )}
        </section>

        <div className='flex flex-col gap-4'>
          <section className='flex flex-col gap-3 rounded-xl border border-border bg-card p-5'>
            <h2 className='font-mono text-xs uppercase tracking-wider text-muted-foreground'>How a request moves</h2>
            <ol className='flex flex-wrap items-center gap-x-2 gap-y-2 text-xs'>
              {LIFECYCLE.map((stage, index) => (
                <li key={stage} className='flex items-center gap-2'>
                  {index > 0 && <span aria-hidden className='h-px w-5 bg-border' />}
                  <span className='rounded-full border border-border px-2.5 py-1 font-mono text-muted-foreground'>
                    {stage}
                  </span>
                </li>
              ))}
            </ol>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              Owners sign off-chain for free. When the threshold is reached, one on-chain transaction executes the
              request. Requests execute in nonce order.
            </p>
          </section>

          <section className='flex flex-col rounded-xl border border-border bg-card p-5'>
            <h2 className='mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground'>Read first</h2>
            {GUIDES.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className='flex items-center justify-between gap-3 border-t border-border py-2.5 text-sm text-foreground transition-colors first:border-t-0 hover:text-primary'
              >
                {guide.title}
                <ChevronRightIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
              </Link>
            ))}
          </section>

          <p className='flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground'>
            <TriangleAlertIcon className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
            Early-stage project. The contracts are open-source but not professionally audited. Start on a testnet.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GetStarted
