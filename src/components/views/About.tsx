import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AddIcon, CheckCircleIcon, ExternalLinkIcon, LockIcon, ViewIcon, StarIcon, SettingsIcon } from '../icons/ChakraIcons'
import BigCard from '../cards/BigCard'
import { Button } from '@/components/ui/button'

const MotionVStack = motion.div

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
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

const GITHUB_APP_URL = 'https://github.com/marc-aurele-besner/mymultisig-app'
const GITHUB_CONTRACT_URL = 'https://github.com/marc-aurele-besner/mymultisig-contract'

const features = [
  {
    icon: <LockIcon boxSize={20} className="shrink-0" />,
    title: 'Lightweight contracts',
    description: 'Clear logic, minimal complexity. The code is written to be readable so that review and future audits are easier.'
  },
  {
    icon: <StarIcon boxSize={20} className="shrink-0" />,
    title: 'Gas-conscious design',
    description: 'Optimized for low transaction costs. Built to keep onchain operations affordable.'
  },
  {
    icon: <ViewIcon boxSize={20} className="shrink-0" />,
    title: 'Open source',
    description: 'Contracts and app code are available for review. No hidden logic.'
  },
  {
    icon: <SettingsIcon boxSize={20} className="shrink-0" />,
    title: 'Modern stack',
    description: 'Built with Next.js, shadcn UI, and wagmi for a responsive experience.'
  }
]

const About: React.FC = () => {
  return (
    <div className="flex justify-center">
      <BigCard className="min-h-[60vh] max-w-[1200px]">
        <div className="flex w-full justify-center py-4 md:py-8">
          <MotionVStack
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col gap-6 md:gap-8"
          >
            <motion.div variants={itemVariants} className="text-center">
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-primary">THE PROJECT</p>
              <h1 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                About MyMultiSig
              </h1>
              <p className="mx-auto max-w-[700px] text-lg font-medium leading-relaxed text-foreground md:text-xl">
                An open-source multisig smart contract and web app. Simple architecture, designed for
                clarity. Early-stage project—contracts are available for review but not professionally audited.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-[800px] text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Create a multisig, manage signers, and approve transactions with a clean UI. The
                contracts are written to be readable so that review and future audits are easier.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full pt-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-5"
                  >
                    <div className="rounded-lg bg-primary/20 p-3 text-primary">
                      {feature.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row flex-wrap"
            >
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link href="/create-multisig">
                  <AddIcon className="h-4 w-4" />
                  Create a multisig
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 px-8" asChild>
                <Link href="/open-multisig">
                  <CheckCircleIcon className="h-4 w-4" />
                  Open an existing multisig
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="gap-2 px-8 text-primary hover:bg-accent hover:text-primary"
                asChild
              >
                <a href={GITHUB_CONTRACT_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4" />
                  Review contract code
                </a>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="gap-2 px-8 text-muted-foreground hover:bg-accent hover:text-foreground"
                asChild
              >
                <a href={GITHUB_APP_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4" />
                  Review app code
                </a>
              </Button>
            </motion.div>
          </MotionVStack>
        </div>
      </BigCard>
    </div>
  )
}

export default About
