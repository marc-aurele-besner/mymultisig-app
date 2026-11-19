import React from 'react'
import Link from 'next/link'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { glossary, type GlossaryKey } from '../../constants/glossary'

interface TermProps {
  // Which glossary entry to explain
  id: GlossaryKey
  // The words shown in the sentence; defaults to the glossary term in lower case
  children?: React.ReactNode
  className?: string
}

// An inline "what is this?" for a crypto word. A popover rather than a hover
// tooltip so it opens on tap, which is how most newcomers arrive.
const Term: React.FC<TermProps> = ({ id, children, className }) => {
  const entry = glossary[id]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label={`What is ${entry.term.toLowerCase()}?`}
          className={cn(
            'inline cursor-help rounded-sm underline decoration-dotted decoration-from-font underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className
          )}
        >
          {children ?? entry.term.toLowerCase()}
        </button>
      </PopoverTrigger>
      <PopoverContent side='top' collisionPadding={12} className='w-64 p-3 text-left text-xs leading-relaxed'>
        <p className='font-semibold text-foreground'>{entry.term}</p>
        <p className='mt-1 text-muted-foreground'>{entry.definition}</p>
        <Link
          href={`/docs#glossary-${id}`}
          className='mt-2 inline-block text-primary underline-offset-4 hover:underline'
        >
          All terms →
        </Link>
      </PopoverContent>
    </Popover>
  )
}

export default Term
