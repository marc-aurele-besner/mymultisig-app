import React from 'react'
import Link from 'next/link'
import { CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { OnboardingStep } from '../../hooks/useOnboarding'

export interface GettingStartedChecklistProps {
  steps: OnboardingStep[]
  // Compact hides the description of every step except the next one.
  compact?: boolean
}

// The first-run path as a checklist. Purely presentational: the steps and
// their done state come from useOnboarding.
const GettingStartedChecklist: React.FC<GettingStartedChecklistProps> = ({ steps, compact = false }) => {
  const nextKey = steps.find((s) => !s.done)?.key
  return (
    <ol className='flex flex-col'>
      {steps.map((step) => {
        const isNext = step.key === nextKey
        return (
          <li
            key={step.key}
            className={cn(
              'flex items-start gap-3 border-t border-border py-3 first:border-t-0',
              isNext && '-mx-2 rounded-lg border-t-transparent bg-primary/10 px-2 [&+li]:border-t-transparent'
            )}
          >
            <span
              aria-hidden
              className={cn(
                'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',
                step.done ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
              )}
            >
              {step.done && <CheckIcon className='h-3 w-3' strokeWidth={3} />}
            </span>
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span
                className={cn(
                  'text-sm font-semibold',
                  step.done ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground'
                )}
              >
                {step.title}
                {step.done && <span className='sr-only'> (done)</span>}
              </span>
              {(!compact || isNext) && (
                <span className='text-xs leading-relaxed text-muted-foreground'>{step.description}</span>
              )}
            </div>
            {!step.done && step.href != null && step.cta != null && (
              <Button asChild size='sm' variant={isNext ? 'default' : 'outline'} className='shrink-0'>
                <Link href={step.href}>{step.cta}</Link>
              </Button>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default GettingStartedChecklist
