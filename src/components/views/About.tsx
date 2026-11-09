import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { EyeIcon, FeatherIcon, FuelIcon, LayersIcon, type LucideIcon } from 'lucide-react'
import { AddIcon, ExternalLinkIcon, WarningTwoIcon } from '../icons/ChakraIcons'
import PageHero from '../layout/PageHero'
import networks from '../../constants/networks'
import { Button } from '@/components/ui/button'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const, staggerChildren: 0.08 }
  }
}

const childVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
}

const GITHUB_APP_URL = 'https://github.com/marc-aurele-besner/mymultisig-app'
const GITHUB_CONTRACT_URL = 'https://github.com/marc-aurele-besner/mymultisig-contract'

const mainnetCount = networks.filter((chain) => !chain.testnet).length

const facts: { label: string; value: string }[] = [
  { label: 'Custody', value: 'Non-custodial. The app never holds keys or funds.' },
  { label: 'Source', value: 'Open source, MIT licensed' },
  { label: 'Networks', value: `${mainnetCount} EVM mainnets, ${networks.length - mainnetCount} testnets` },
  { label: 'Fees', value: 'None from the app. You pay network gas only.' },
  { label: 'Audit', value: 'Not professionally audited yet' }
]

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FeatherIcon,
    title: 'Lightweight contracts',
    description:
      'Clear logic, minimal complexity. The code is written to be readable so that review and future audits are easier.'
  },
  {
    icon: FuelIcon,
    title: 'Gas-conscious design',
    description:
      'Owners sign off-chain for free. One transaction executes a request, so onchain operations stay affordable.'
  },
  {
    icon: EyeIcon,
    title: 'Open source',
    description: 'Contracts and app code are available for review. No hidden logic: what you read is what runs.'
  },
  {
    icon: LayersIcon,
    title: 'Modern stack',
    description: 'Built with Next.js, shadcn UI, wagmi and viem for a responsive experience.'
  }
]

const pieces: { keyword: string; title: string; description: string; href: string }[] = [
  {
    keyword: 'contracts',
    title: 'Smart contracts',
    description: 'The wallet, its Extended variant and the factory that deploys them.',
    href: GITHUB_CONTRACT_URL
  },
  {
    keyword: 'app',
    title: 'Web app',
    description: 'This site: create, propose, sign and execute, plus the API that stores requests.',
    href: GITHUB_APP_URL
  },
  {
    keyword: 'abis',
    title: 'ABIs on npm',
    description: 'mymultisig-contract ships the ABIs and deployed factory addresses.',
    href: 'https://www.npmjs.com/package/mymultisig-contract'
  },
  {
    keyword: 'sdk',
    title: 'SDK, CLI and MCP server',
    description: 'The same protocol code this app runs, for scripts and AI agents.',
    href: 'https://www.npmjs.com/package/mymultisig-sdk'
  }
]

// Hero visual: the project's facts as a ledger-style card.
const FactSheet: React.FC = () => (
  <dl className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-[0_0_80px_-24px] shadow-primary/25">
    <span className="mb-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">At a glance</span>
    {facts.map((fact, index) => (
      <motion.div
        key={fact.label}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.55 + index * 0.08, ease: 'easeOut' }}
        className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-t border-border py-3 first:border-t-0"
      >
        <dt className="font-mono text-xs text-primary">{fact.label}</dt>
        <dd className="text-sm text-foreground">{fact.value}</dd>
      </motion.div>
    ))}
  </dl>
)

const About: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-14 md:gap-16">
      <PageHero
        eyebrow="THE PROJECT"
        title="About MyMultiSig"
        lead={
          <>
            An open-source multisig smart contract and web app. Simple architecture, designed for clarity: create a
            shared wallet, manage its signers, and approve transactions together. No single key can move the funds.
          </>
        }
        actions={
          <>
            <Button size="lg" className="gap-2" asChild>
              <Link href="/create-multisig">
                <AddIcon className="h-4 w-4" />
                Create a multisig
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/open-multisig">Open an existing multisig</Link>
            </Button>
          </>
        }
        visual={<FactSheet />}
      />

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="flex flex-col gap-5"
      >
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">What it is built on</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={childVariants}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className="rounded-lg bg-primary/15 p-3 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12"
      >
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Everything is public</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The contracts, this app and the tooling around them are developed in the open. Read the code before you
            trust it with anything, and tell us what you find.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" asChild>
              <a href={GITHUB_CONTRACT_URL} target="_blank" rel="noopener noreferrer">
                Review contract code
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </Button>
            <Button variant="ghost" className="gap-2" asChild>
              <a href={GITHUB_APP_URL} target="_blank" rel="noopener noreferrer">
                Review app code
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pieces.map((piece) => (
            <motion.a
              key={piece.keyword}
              variants={childVariants}
              href={piece.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="font-mono text-xs text-primary">{piece.keyword}</span>
              <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {piece.title}
                <ExternalLinkIcon className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
              </span>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{piece.description}</p>
            </motion.a>
          ))}
        </div>
      </motion.section>

      <section className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-5 md:p-6">
        <span className="rounded-lg bg-primary/15 p-2.5 text-primary">
          <WarningTwoIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">Where the project stands</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            MyMultiSig is an early-stage project. The contracts are available for review but have not been
            professionally audited, and some features may be incomplete. Start on a testnet, verify every request
            before you sign it, and treat the app accordingly.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-primary/40 bg-primary/5 p-6 md:p-8">
        <div className="min-w-0 flex-1 basis-72">
          <p className="font-mono text-xs tracking-[0.2em] text-primary">BUILT IN THE OPEN</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
            Maintained by Marc-Aurele Besner.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Questions, bug reports and contributions are welcome. GitHub issues get the fastest answer; the contact
            form reaches the maintainer directly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/contact">Get in touch</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs">Read the guides</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default About
