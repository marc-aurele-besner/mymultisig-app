import React from 'react'
import { cn } from '@/lib/utils'

export interface SectionCardProps {
  title: React.ReactNode
  // Right side of the header (a link, a count, a button).
  action?: React.ReactNode
  // Remove the body padding, for lists whose rows carry their own.
  flush?: boolean
  className?: string
  children: React.ReactNode
}

// Card with a ruled header. The shared container for the lists and panels
// on wallet pages, so they line up and read as one family.
const SectionCard: React.FC<SectionCardProps> = ({ title, action, flush = false, className, children }) => (
  <section className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
    <header className='flex items-center justify-between gap-3 border-b border-border px-5 py-3'>
      <h3 className='text-base font-semibold text-foreground'>{title}</h3>
      {action}
    </header>
    <div className={cn(!flush && 'p-5')}>{children}</div>
  </section>
)

export default SectionCard
