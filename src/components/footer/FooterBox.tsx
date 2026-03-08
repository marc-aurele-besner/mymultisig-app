import Link from 'next/link'
import React from 'react'
import { LockIcon, ExternalLinkIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const FooterBox: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        'm-2 mb-4 w-[95%] max-w-[1400px] rounded-2xl border border-border bg-background/80 p-4 shadow-lg backdrop-blur-xl md:mb-6 md:w-[90vw] md:p-6 lg:w-[85vw]'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2">
            <LockIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col items-start gap-0">
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-sm font-bold text-transparent">
              MyMultiSig.app
            </span>
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/marc-aurele-besner/mymultisig-contract"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span className="hidden sm:inline">Smart Contracts</span>
            <ExternalLinkIcon boxSize={12} className="text-muted-foreground" />
          </Link>
          <Link
            href="https://github.com/marc-aurele-besner/mymultisig-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span className="hidden sm:inline">Web App</span>
            <ExternalLinkIcon boxSize={12} className="text-muted-foreground" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default FooterBox
