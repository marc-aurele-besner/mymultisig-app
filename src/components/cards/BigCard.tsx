import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BigCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hasGlow?: boolean
}

const BigCard: React.FC<BigCardProps> = ({
  children,
  className,
  hasGlow = false,
  ...rest
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'relative w-full max-w-[1200px] overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8 lg:p-10',
        hasGlow && 'shadow-[0_0_80px_-24px] shadow-primary/25',
        className
      )}
    >
      <div className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div {...rest}>{children}</div>
    </motion.div>
  )
}

export default BigCard
