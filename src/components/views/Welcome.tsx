import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import ConnectWallet from './ConnectWallet'
import ConnectedWallet from './ConnectedWallet'
import HeroQuorum from './HeroQuorum'
import Disclaimer from '../modals/Disclaimer'
import { AddIcon, CheckCircleIcon, ExternalLinkIcon } from '../icons/ChakraIcons'

const GITHUB_APP_URL = 'https://github.com/marc-aurele-besner/mymultisig-app'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
}

const principles = [
  {
    keyword: 'open-source',
    title: 'Open source',
    description:
      'Contracts and app code are available for review. No hidden logic—what you see is what runs.'
  },
  {
    keyword: 'minimal',
    title: 'Simple design',
    description:
      'Minimal architecture designed for clarity. Fewer moving parts means easier to understand and reason about.'
  },
  {
    keyword: 'low-gas',
    title: 'Gas-conscious',
    description: 'Optimized for low transaction costs. Built to keep onchain operations affordable.'
  }
]

const howItWorksSteps = [
  {
    step: '01',
    title: 'Create a multisig',
    description: 'Deploy a shared wallet on your chosen chain. You pick the network and get a new multisig address.'
  },
  {
    step: '02',
    title: 'Add owners and set the threshold',
    description: 'Define who can sign and how many approvals are required before any transaction can run.'
  },
  {
    step: '03',
    title: 'Propose and approve transactions',
    description: 'Any owner can propose a transaction. Once enough owners approve, any owner can execute it.'
  }
]

const whoItsFor = [
  'Small teams and onchain collaborators',
  'Treasury or shared fund management',
  'Protocols and communities',
  'Anywhere shared custody or multiple signers are needed'
]

const faqItems = [
  {
    q: 'What is a multisig?',
    a: 'A multisig (multi-signature) wallet is a shared wallet that requires multiple people to approve a transaction before it can be executed. No single person can move funds alone.'
  },
  {
    q: 'Why would I use one?',
    a: 'Multisigs are useful whenever you want shared control: team treasuries, community funds, protocol reserves, or any situation where you do not want one key to have full control.'
  },
  {
    q: 'Do all owners need to approve every transaction?',
    a: 'No. You set a threshold when creating the multisig (e.g. 2 of 3). Once that many owners have approved a proposal, the transaction can be executed. Not everyone has to sign every time.'
  },
  {
    q: 'Is the project audited?',
    a: 'No. MyMultiSig is an early-stage project. The contracts are open-source and available for review, but they have not been professionally audited. Use at your own risk.'
  },
  {
    q: 'Where can I review the code?',
    a: 'The smart contracts and this web app are both on GitHub. Use the "Review the code" link in the footer or on this page to open the repositories.'
  }
]

const Welcome: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <Disclaimer />

      {/* Hero */}
      <section className="grid items-center gap-10 pt-2 md:pt-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <p className="mb-4 font-mono text-xs tracking-[0.2em] text-primary">
            SHARED WALLETS, ENFORCED ONCHAIN
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            No single key can move the funds.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Create a shared wallet, choose its owners, and set how many must approve. Every transaction
            waits for that quorum—then anyone on the team can execute it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 px-7" asChild>
              <Link href="/createMultiSig">
                <AddIcon className="h-4 w-4" />
                Create a multisig
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-7" asChild>
              <Link href="/useYourMultiSig">
                <CheckCircleIcon className="h-4 w-4" />
                Open an existing multisig
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-5 font-mono text-xs text-muted-foreground">
            <Link href="/integration" className="transition-colors hover:text-foreground">
              Integration
            </Link>
            <span aria-hidden className="text-border">/</span>
            <a
              href={GITHUB_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              Review the code
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>
        </motion.div>

        <HeroQuorum />
      </section>

      {/* How it works */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          How it works
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-8 border-t border-border pt-8 md:grid-cols-3 md:gap-10">
          {howItWorksSteps.map((item) => (
            <div key={item.step}>
              <span className="font-mono text-sm text-primary">{item.step}</span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Principles + who it's for */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {principles.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6">
              <span className="font-mono text-xs text-primary">{item.keyword}</span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span className="font-mono text-xs text-foreground">Built for:</span>
          {whoItsFor.map((item, index) => (
            <React.Fragment key={item}>
              {index > 0 && <span aria-hidden className="text-border">/</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">FAQ</h2>
        <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-8 border-t border-border pt-8 md:grid-cols-2">
          {faqItems.map((item) => (
            <div key={item.q}>
              <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Wallet */}
      {hasMounted && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="rounded-xl border border-border bg-card p-6 md:p-8"
        >
          {!isConnected ? <ConnectWallet /> : <ConnectedWallet />}
        </motion.section>
      )}
    </div>
  )
}

export default Welcome
