import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface GuidePathStep {
  href: string
  label: string
  hint: string
}

const STEP_MS = 1800

// Hero visual for the guides index: the guides as one path, in the order a
// newcomer would read them. A marker walks down the path; each stop is a
// link. With reduced motion the path is shown at rest.
const GuidePath: React.FC<{ steps: GuidePathStep[] }> = ({ steps }) => {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const timer = setInterval(() => setActive((current) => (current + 1) % steps.length), STEP_MS)
    return () => clearInterval(timer)
  }, [reduceMotion, steps.length])

  return (
    <nav
      aria-label='Suggested reading order'
      className='rounded-xl border border-border bg-card p-5 shadow-[0_0_80px_-24px] shadow-primary/25'
    >
      <span className='font-mono text-[11px] uppercase tracking-wider text-muted-foreground'>Reading order</span>
      <ol className='mt-3 flex flex-col'>
        {steps.map((step, index) => {
          const reached = reduceMotion || index <= active
          const current = !reduceMotion && index === active
          return (
            <motion.li
              key={step.href}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.5 + index * 0.08, ease: 'easeOut' }}
              className='relative flex gap-3 pb-4 last:pb-0'
            >
              {/* Connector to the next stop */}
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-[13px] top-7 h-[calc(100%-28px)] w-px transition-colors duration-500',
                    !reduceMotion && index < active ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  'relative grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-xs transition-colors duration-500',
                  current
                    ? 'border-primary bg-primary text-primary-foreground'
                    : reached
                      ? 'border-primary/50 bg-primary/15 text-primary'
                      : 'border-border bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </span>
              <Link href={step.href} className='group flex min-w-0 flex-1 flex-col pt-0.5'>
                <span
                  className={cn(
                    'text-sm font-semibold transition-colors group-hover:text-primary',
                    current ? 'text-foreground' : 'text-foreground/90'
                  )}
                >
                  {step.label}
                </span>
                <span className='text-xs text-muted-foreground'>{step.hint}</span>
              </Link>
            </motion.li>
          )
        })}
      </ol>
    </nav>
  )
}

export default GuidePath
