import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { TypedEyebrow, WordReveal } from '@/components/ui/reveal'
import ConnectWallet from './ConnectWallet'
import ConnectedWallet from './ConnectedWallet'
import HeroQuorum from './HeroQuorum'
import useConnectModal from '../../states/connectModal'
import { AddIcon, ArrowForwardIcon, CheckIcon, WalletIcon, ExternalLinkIcon } from '../icons/ChakraIcons'

const GITHUB_APP_URL = 'https://github.com/marc-aurele-besner/mymultisig-app'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const, staggerChildren: 0.08 }
  }
}

// For items inside a section: the parent drives timing via staggerChildren.
const childVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const }
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

export const faqItems = [
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
    q: 'Which networks does MyMultiSig support?',
    a: 'Ethereum, Polygon, Optimism, Arbitrum, Avalanche, BNB Chain and Gnosis, plus their testnets such as Sepolia. The same open-source contract is deployed on every network.'
  },
  {
    q: 'Does signing a transaction cost gas?',
    a: 'No. Owners approve a request by signing an EIP-712 message offchain, which is free. Only the final execution is an onchain transaction, and any owner can send it once the threshold is met.'
  },
  {
    q: 'Can an AI agent use a MyMultiSig wallet?',
    a: 'Yes. Claude, Cursor or any MCP client can check balances, propose transactions and sign with its own owner key through the MyMultiSig MCP server, CLI, SDK or a scoped API key. The threshold is still enforced onchain, so an agent cannot move funds alone.'
  },
  {
    q: 'Is the project audited?',
    a: 'No. MyMultiSig is an early-stage project. The contracts are open-source and available for review, but they have not been professionally audited. Use at your own risk.'
  },
  {
    q: 'Where can I review the code?',
    a: 'Both are open source on GitHub: the smart contracts in marc-aurele-besner/mymultisig-contract and this web app, API, SDK, MCP server and CLI in marc-aurele-besner/mymultisig-app. The "Review the code" link at the top of this page opens the app repository.'
  }
]

const Welcome: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected } = useAccount()
  const openConnectModal = useConnectModal((state) => state.setOpen)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      {/* Hero: the pitch on the left, the first action (connect) on the right */}
      <section className="grid items-center gap-10 pt-2 md:pt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          {/* The eyebrow carries the branded h1 so search engines see the product name;
              the display line below stays the visual headline. */}
          <TypedEyebrow as="h1" text="MYMULTISIG — SHARED WALLETS, ENFORCED ONCHAIN" className="mb-4" />
          <WordReveal
            as="p"
            text="No single key can move the funds."
            delay={0.25}
            className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl xl:text-6xl"
          />
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: 'easeOut' }}
            className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground"
          >
            Create a shared wallet, choose its owners, and set how many must approve. Every transaction
            waits for that quorum—then anyone on the team can execute it.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.85, ease: 'easeOut' }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" className="gap-2 px-7" asChild>
              <Link href="/create-multisig">
                <AddIcon className="h-4 w-4" />
                Create a multisig
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-7" asChild>
              <Link href="/open-multisig">
                <WalletIcon className="h-4 w-4" />
                Open an existing multisig
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.05 }}
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground"
          >
            <Link href="/docs/what-is-a-multisig" className="text-primary transition-colors hover:text-foreground">
              New to multisigs? Start here
            </Link>
            <span aria-hidden className="text-border">/</span>
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
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-[0_0_80px_-24px] shadow-primary/25"
        >
          {hasMounted && isConnected ? (
            <ConnectedWallet />
          ) : (
            <>
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Connect your wallet</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Free, and it creates nothing yet.</p>
              </div>
              {/* Two most common options here; the dialog has them all */}
              <div className="min-h-[104px]">{hasMounted && <ConnectWallet compact list limit={2} />}</div>
              <button
                type="button"
                onClick={() => openConnectModal(true)}
                className="self-start text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                More wallets →
              </button>
            </>
          )}
        </motion.div>
      </section>

      {/* The mechanism, shown and then explained */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12"
      >
        <HeroQuorum />
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How it works
          </h2>
          <ol className="mt-6 flex flex-col">
            {howItWorksSteps.map((item) => (
              <motion.li
                key={item.step}
                variants={childVariants}
                className="flex gap-4 border-t border-border py-5 first:border-t-0 first:pt-0"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-sm text-primary">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </ol>
          <Link
            href="/get-started"
            className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            Follow the guided setup →
          </Link>
        </div>
      </motion.section>

      {/* Principles */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {principles.map((item) => (
          <motion.div
            key={item.title}
            variants={childVariants}
            className="rounded-xl border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/40"
          >
            <span className="font-mono text-xs text-primary">{item.keyword}</span>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* FAQ + who it is for */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-12"
      >
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">FAQ</h2>
          <div className="mt-6 flex flex-col">
            {faqItems.map((item) => (
              <motion.div
                key={item.q}
                variants={childVariants}
                className="border-t border-border py-4 first:border-t-0 first:pt-0"
              >
                <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Want more detail?{' '}
            <Link href="/docs/what-is-a-multisig" className="text-primary underline-offset-4 hover:underline">
              Read the full multisig guide
            </Link>{' '}
            or browse{' '}
            <Link href="/docs" className="text-primary underline-offset-4 hover:underline">
              all guides
            </Link>
            .
          </p>
        </div>
        <motion.div variants={childVariants} className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Built for</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {whoItsFor.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.section>

      {/* People and their agents */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <Link
          href="/agents"
          className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-primary/40 bg-primary/5 p-6 transition-colors hover:border-primary/70 md:p-8"
        >
          <div className="min-w-0 flex-1 basis-72">
            <p className="font-mono text-xs tracking-[0.2em] text-primary">AGENTS &amp; API</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Built for people and for their agents.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Claude, Cursor or your own scripts can read the queue, propose and co-sign. A threshold they can never
              meet alone keeps a human in every decision.
            </p>
          </div>
          <span className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
            Explore agents
            <ArrowForwardIcon className="h-4 w-4" />
          </span>
        </Link>
      </motion.section>
    </div>
  )
}

export default Welcome
