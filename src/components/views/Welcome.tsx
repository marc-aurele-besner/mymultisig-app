import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import BigCard from '../cards/BigCard'
import ConnectWallet from './ConnectWallet'
import ConnectedWallet from './ConnectedWallet'
import Disclaimer from '../modals/Disclaimer'
import { AddIcon, CheckCircleIcon, LinkIcon, LockIcon, StarIcon, ViewIcon } from '../icons/ChakraIcons'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
}

const features = [
  {
    icon: <LockIcon boxSize={24} className="shrink-0" />,
    title: 'Secure by Design',
    description:
      'Minimalistic smart contract architecture for maximum security and auditability.'
  },
  {
    icon: <ViewIcon boxSize={24} className="shrink-0" />,
    title: 'Full Transparency',
    description: 'Open-source contracts with clear, readable logic for easy verification.'
  },
  {
    icon: <StarIcon boxSize={24} className="shrink-0" />,
    title: 'Gas Efficient',
    description: 'Optimized for low transaction costs without compromising on security.'
  }
]

const Welcome: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className="flex justify-center">
      <Disclaimer />
      <BigCard className="min-h-[70vh] max-w-[1200px]" hasGlow>
        <div className="flex w-full justify-center py-4 md:py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col gap-6 md:gap-8"
          >
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">
                  Secure Multi-Signature
                </span>
                <br />
                <span className="text-foreground">for the Modern Web3</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg font-medium leading-relaxed text-foreground md:text-xl">
                A minimalistic Solidity smart contract for secure and streamlined multi-signature
                transactions. Simple, auditable, and powerful.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link href="/createMultiSig">
                  <AddIcon className="h-4 w-4" />
                  Create a MultiSig
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 px-8" asChild>
                <Link href="/useYourMultiSig">
                  <CheckCircleIcon className="h-4 w-4" />
                  Use your MultiSig
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="gap-2 px-8 text-primary hover:bg-accent hover:text-primary" asChild>
                <Link href="/integration">
                  <LinkIcon className="h-4 w-4" />
                  Integration
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full pt-4 md:pt-8">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    className="rounded-xl border border-border bg-muted/30 p-5 md:p-6"
                  >
                    <div className="flex flex-col items-start gap-3">
                      <div className="rounded-lg bg-primary/20 p-3 text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-4 w-full border-t border-border pt-4 md:mt-6 md:pt-6"
            >
              {hasMounted && (
                <div className="flex flex-col gap-4">
                  {!isConnected ? <ConnectWallet /> : <ConnectedWallet />}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </BigCard>
    </div>
  )
}

export default Welcome
