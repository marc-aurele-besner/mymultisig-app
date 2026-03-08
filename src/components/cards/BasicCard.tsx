import React from 'react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BasicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const BasicCard: React.FC<BasicCardProps> = ({ children, className, ...rest }) => {
  return (
    <Card
      className={cn(
        'w-full border-border bg-card/95 p-4 shadow-md backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-lg md:p-5',
        className
      )}
      {...rest}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </Card>
  )
}

export default BasicCard
