import React from 'react'
import { motion } from 'framer-motion'

import { TypedEyebrow, WordReveal } from '@/components/ui/reveal'
import { cn } from '@/lib/utils'

export interface PageHeroProps {
  eyebrow: string
  title: string
  lead: React.ReactNode
  // Buttons under the lead.
  actions?: React.ReactNode
  // Optional illustration on the right (stacks below on small screens).
  visual?: React.ReactNode
  className?: string
}

// Shared page opener: typed eyebrow, word-by-word headline, lead and
// actions, with an optional animated visual beside them. Uses the same
// entrance motion as the home hero so top-level pages feel related.
const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, lead, actions, visual, className }) => (
  <section
    className={cn(
      'grid items-center gap-8 pt-2 md:pt-4',
      visual != null && 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12',
      className
    )}
  >
    <div className='min-w-0'>
      <TypedEyebrow text={eyebrow} className='mb-3' />
      <WordReveal
        text={title}
        delay={0.2}
        className='font-display text-3xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl'
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
        className='mt-4 max-w-xl text-base leading-relaxed text-muted-foreground'
      >
        {lead}
      </motion.div>
      {actions != null && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: 'easeOut' }}
          className='mt-6 flex flex-wrap gap-2'
        >
          {actions}
        </motion.div>
      )}
    </div>
    {visual != null && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
        className='min-w-0'
      >
        {visual}
      </motion.div>
    )}
  </section>
)

export default PageHero
