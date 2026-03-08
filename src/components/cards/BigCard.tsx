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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'relative w-full max-w-[1200px] overflow-hidden rounded-2xl border border-border bg-card/90 p-6 shadow-lg backdrop-blur-xl md:p-8 lg:p-10',
        hasGlow && 'before:absolute before:inset-[-2px] before:rounded-[inherit] before:border-2 before:border-transparent before:bg-gradient-to-br before:from-primary/40 before:via-blue-500/40 before:to-purple-500/40 before:content-[""] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude]',
        className
      )}
    >
      <div className="absolute left-[10%] right-[10%] top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
      <div {...rest}>{children}</div>
    </motion.div>
  )
}

export default BigCard
