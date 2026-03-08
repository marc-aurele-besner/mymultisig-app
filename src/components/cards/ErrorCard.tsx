import React from 'react'
import { WarningIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ErrorCardProps {
  children: React.ReactNode
  className?: string
}

const ErrorCard: React.FC<ErrorCardProps> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'm-2 flex w-full items-start gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 shadow-md backdrop-blur-sm md:w-[94%]',
        className
      )}
    >
      <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <p className="text-sm font-medium leading-relaxed text-destructive">
        {children}
      </p>
    </motion.div>
  )
}

export default ErrorCard
