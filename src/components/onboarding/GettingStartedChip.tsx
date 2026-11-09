import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'

import useOnboarding from '../../hooks/useOnboarding'
import useOnboardingState from '../../states/onboarding'
import ProgressRing from './ProgressRing'

// Compact progress pointer at the bottom of the sidebar. Disappears once
// every step is done or the user hides the checklist.
const GettingStartedChip: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { doneCount, total, next, isComplete } = useOnboarding()
  const { dismissed } = useOnboardingState()

  if (isComplete || dismissed || next == null) return null

  return (
    <Link
      href='/get-started'
      onClick={onNavigate}
      className='flex items-center gap-2.5 rounded-lg border border-primary/35 bg-primary/10 p-2.5 transition-colors hover:border-primary/60'
    >
      <ProgressRing done={doneCount} total={total} className='[&>span:first-child]:bg-background' />
      <span className='flex min-w-0 flex-1 flex-col'>
        <span className='text-xs font-semibold text-foreground'>Getting started</span>
        <span className='truncate text-xs text-muted-foreground'>Next: {next.title}</span>
      </span>
      <ChevronRightIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
    </Link>
  )
}

export default GettingStartedChip
