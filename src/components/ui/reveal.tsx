import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WordRevealProps {
  text: string
  as?: React.ElementType
  className?: string
  delay?: number
}

// Headline entrance: each word rises out of a clipped line, staggered left to
// right. Screen readers get the plain text; the animated copy is aria-hidden.
const WordReveal: React.FC<WordRevealProps> = ({ text, as: Tag = 'h1', className, delay = 0 }) => {
  const words = text.split(' ')
  return (
    <Tag className={className}>
      <span className='sr-only'>{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i} className='-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom'>
            <motion.span
              className='inline-block'
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  )
}

interface TypedEyebrowProps {
  text: string
  as?: React.ElementType
  className?: string
  delay?: number
}

// Mono eyebrow that types on like terminal output, with a caret that blinks
// while typing and then fades out.
const TypedEyebrow: React.FC<TypedEyebrowProps> = ({ text, as: Tag = 'p', className, delay = 0.1 }) => {
  const charDelay = 0.03
  const typingTime = text.length * charDelay
  return (
    <Tag className={cn('font-mono text-xs tracking-[0.2em] text-primary', className)}>
      <span className='sr-only'>{text}</span>
      <span aria-hidden>
        {text.split('').map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.01, delay: delay + i * charDelay }}
          >
            {ch}
          </motion.span>
        ))}
        <motion.span
          className='ml-1 inline-block h-[1em] w-[0.55ch] translate-y-[0.18em] bg-primary'
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0, 1, 0, 1, 0] }}
          transition={{ delay, duration: typingTime + 1.1, ease: 'linear', times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
        />
      </span>
    </Tag>
  )
}

export { WordReveal, TypedEyebrow }
