import React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressRingProps {
  done: number
  total: number
  size?: number
  className?: string
}

// Small circular progress with the "done/total" count in the middle.
const ProgressRing: React.FC<ProgressRingProps> = ({ done, total, size = 40, className }) => {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <span
      role='img'
      aria-label={`${done} of ${total} steps done`}
      className={cn('relative grid shrink-0 place-items-center rounded-full font-mono text-[11px]', className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--primary) ${percent}%, var(--muted) 0)`
      }}
    >
      <span className='absolute inset-1 rounded-full bg-card' />
      <span className='relative text-foreground'>
        {done}/{total}
      </span>
    </span>
  )
}

export default ProgressRing
