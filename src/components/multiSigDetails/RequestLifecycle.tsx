import React from 'react'
import { cn } from '@/lib/utils'

export interface RequestLifecycleProps {
  signatures: number
  threshold: number
  isExecuted?: boolean
  // Executed but the inner call reverted.
  isFailed?: boolean
  isCancelled?: boolean
  className?: string
}

type StageState = 'done' | 'now' | 'todo' | 'failed'

const DOT: Record<StageState, string> = {
  done: 'border-primary bg-primary',
  now: 'border-primary ring-4 ring-primary/20',
  todo: 'border-muted-foreground/50',
  failed: 'border-destructive bg-destructive'
}

const TEXT: Record<StageState, string> = {
  done: 'text-foreground',
  now: 'font-semibold text-primary',
  todo: 'text-muted-foreground',
  failed: 'text-destructive'
}

// Where a request is on its way: proposed, collecting signatures, ready,
// executed. One line, so a signer sees at a glance what happens next.
const RequestLifecycle: React.FC<RequestLifecycleProps> = ({
  signatures,
  threshold,
  isExecuted = false,
  isFailed = false,
  isCancelled = false,
  className
}) => {
  const reached = signatures >= threshold
  const closed = isExecuted || isCancelled
  const stages: { label: string; state: StageState }[] = [
    { label: 'Proposed', state: 'done' },
    {
      label: `Signed ${Math.min(signatures, threshold)} of ${threshold}`,
      state: reached || isExecuted ? 'done' : closed ? 'todo' : 'now'
    },
    { label: 'Ready', state: isExecuted ? 'done' : reached && !closed ? 'now' : 'todo' },
    {
      label: isCancelled ? 'Cancelled' : isFailed ? 'Failed' : 'Executed',
      state: isCancelled || isFailed ? 'failed' : isExecuted ? 'done' : 'todo'
    }
  ]
  return (
    <ol className={cn('flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs', className)}>
      {stages.map((stage, index) => (
        <li key={stage.label} className='flex items-center gap-2'>
          {index > 0 && <span aria-hidden className='h-px w-4 bg-border sm:w-6' />}
          <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full border-[1.5px]', DOT[stage.state])} />
          <span className={cn('whitespace-nowrap', TEXT[stage.state])}>{stage.label}</span>
        </li>
      ))}
    </ol>
  )
}

export default RequestLifecycle
