import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'
import BrandIcon, { Brand } from '../icons/BrandIcon'

const MESSAGES: { brand: Brand; where: string; stage: string; text: string }[] = [
  {
    brand: 'slack',
    where: '#treasury',
    stage: 'request proposed',
    text: 'New request on Team Treasury: “Pay the Q4 audit deposit”.'
  },
  {
    brand: 'email',
    where: 'Inbox',
    stage: 'awaiting signatures',
    text: 'Signature needed: 1 of 2 collected. Yours is the one it is waiting for.'
  },
  {
    brand: 'telegram',
    where: 'Signers group',
    stage: 'ready to execute',
    text: 'Ready to execute: the threshold is reached. Any owner can run it.'
  }
]

const STEP_MS = 2400

// Example of the three lifecycle moments landing in three channels. The
// highlight walks through them in order; with reduced motion all three are
// shown at rest. Illustrative copy, not live notifications.
const NotificationFeed: React.FC = () => {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const timer = setInterval(() => setActive((current) => (current + 1) % MESSAGES.length), STEP_MS)
    return () => clearInterval(timer)
  }, [reduceMotion])

  return (
    <div
      className='flex flex-col gap-3'
      role='img'
      aria-label='Example: a new request is announced in Slack, a signature reminder arrives by email, and Telegram reports it is ready to execute.'
    >
      {MESSAGES.map((message, index) => {
        const isActive = !reduceMotion && index === active
        return (
          <motion.div
            key={message.stage}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0, scale: isActive ? 1.02 : 1 }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.5 + index * 0.15, ease: [0.25, 1, 0.5, 1] }}
            className={cn(
              'flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors duration-500',
              isActive ? 'border-primary/60 shadow-[0_0_60px_-24px] shadow-primary/40' : 'border-border'
            )}
          >
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted'>
              <BrandIcon brand={message.brand} size={20} />
            </span>
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <span className='text-sm font-semibold text-foreground'>{message.where}</span>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider transition-colors duration-500',
                    isActive ? 'border-primary/50 bg-primary/15 text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {message.stage}
                </span>
              </div>
              <p className='text-xs leading-relaxed text-muted-foreground'>{message.text}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default NotificationFeed
