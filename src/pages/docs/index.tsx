import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { DownloadIcon, LightbulbIcon, PenLineIcon, PlusCircleIcon, SparklesIcon, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import GuidePath from '../../components/docs/GuidePath'
import { ArrowForwardIcon } from '../../components/icons/ChakraIcons'
import PageHero from '../../components/layout/PageHero'

const siteUrl = 'https://mymultisig.app'

export const guides = [
  {
    href: '/docs/what-is-a-multisig',
    kicker: 'CONCEPTS',
    title: 'What is a multisig?',
    description:
      'How multi-signature wallets work, what an approval threshold is, and when shared control beats a single key.'
  },
  {
    href: '/docs/create-a-multisig',
    kicker: 'HOW-TO',
    title: 'Create a multisig',
    description: 'Deploy a shared wallet: pick a network, add owners, set the threshold, and confirm the transaction.'
  },
  {
    href: '/docs/propose-sign-execute',
    kicker: 'HOW-TO',
    title: 'Propose, sign, and execute transactions',
    description: 'The full lifecycle of a multisig transaction, from proposal to offchain signatures to onchain execution.'
  },
  {
    href: '/docs/import-a-multisig',
    kicker: 'HOW-TO',
    title: 'Import an existing multisig',
    description: 'Already deployed a MyMultiSig contract? Add it by address to track and manage it from any device.'
  },
  {
    href: '/docs/ai-agents',
    kicker: 'HOW-TO',
    title: 'Manage a multisig with AI agents',
    description:
      'Connect Claude or any MCP client: scoped API keys, the MCP server, CLI and SDK to propose, sign and execute.'
  }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'MyMultiSig guides',
  itemListElement: guides.map((guide, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: guide.title,
    url: `${siteUrl}${guide.href}`
  }))
}

// Presentation details per guide, keyed by href so the exported `guides`
// list (used for structured data) keeps its shape.
const guideMeta: Record<string, { icon: LucideIcon; hint: string; goal: string }> = {
  '/docs/what-is-a-multisig': {
    icon: LightbulbIcon,
    hint: 'The idea, in plain words',
    goal: 'understand what a multisig is'
  },
  '/docs/create-a-multisig': {
    icon: PlusCircleIcon,
    hint: '6 steps, one transaction',
    goal: 'create my first shared wallet'
  },
  '/docs/propose-sign-execute': {
    icon: PenLineIcon,
    hint: 'The life of a request',
    goal: 'move funds with my co-signers'
  },
  '/docs/import-a-multisig': {
    icon: DownloadIcon,
    hint: 'Add a wallet by address',
    goal: 'open a wallet someone else created'
  },
  '/docs/ai-agents': {
    icon: SparklesIcon,
    hint: 'API keys, MCP server, CLI',
    goal: 'let an agent work the queue'
  }
}

const [startHere, ...howTos] = guides

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>
      <div className='flex w-full flex-col gap-12 md:gap-14'>
        <PageHero
          eyebrow='DOCS'
          title='Guides'
          lead='Short, practical guides to multisig wallets and to running one with MyMultiSig — no prior multisig experience assumed.'
          actions={
            <>
              <Button size='lg' className='gap-2' asChild>
                <Link href={startHere.href}>
                  Start with the basics
                  <ArrowForwardIcon className='h-4 w-4' />
                </Link>
              </Button>
              <Button size='lg' variant='outline' asChild>
                <Link href='/get-started'>Follow the guided setup</Link>
              </Button>
            </>
          }
          visual={
            <GuidePath
              steps={guides.map((guide) => ({
                href: guide.href,
                label: guide.title,
                hint: guideMeta[guide.href].hint
              }))}
            />
          }
        />

        {/* Jump by intent: most readers arrive with a task, not a title */}
        <section className='flex flex-col gap-4'>
          <h2 className='font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>I want to…</h2>
          <div className='flex flex-wrap gap-2'>
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className='inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-primary/50 hover:text-primary'
              >
                {guideMeta[guide.href].goal}
                <ArrowForwardIcon boxSize={14} className='shrink-0 text-muted-foreground' />
              </Link>
            ))}
          </div>
        </section>

        <section className='flex flex-col gap-4'>
          <h2 className='font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>Start here</h2>
          <Link
            href={startHere.href}
            className='group grid items-center gap-6 rounded-xl border border-primary/40 bg-primary/5 p-6 transition-colors hover:border-primary/70 md:grid-cols-[minmax(0,1fr)_auto] md:p-8'
          >
            <div>
              <p className='font-mono text-xs tracking-[0.2em] text-primary'>{startHere.kicker}</p>
              <h3 className='mt-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl'>
                {startHere.title}
              </h3>
              <p className='mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground'>{startHere.description}</p>
              <span className='mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary'>
                Read guide
                <ArrowForwardIcon boxSize={14} className='shrink-0 transition-transform group-hover:translate-x-0.5' />
              </span>
            </div>
            {/* The idea in one picture: three owners, two signatures needed */}
            <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-8 py-6' aria-hidden>
              <div className='flex gap-2'>
                {[true, true, false].map((signed, index) => (
                  <span
                    key={index}
                    className={
                      signed
                        ? 'h-9 w-9 rounded-full bg-primary'
                        : 'h-9 w-9 rounded-full border-2 border-dashed border-muted-foreground/50'
                    }
                  />
                ))}
              </div>
              <span className='font-mono text-xs text-muted-foreground'>2 of 3 signed · funds can move</span>
            </div>
          </Link>
        </section>

        <section className='flex flex-col gap-4'>
          <h2 className='font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>How-to guides</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {howTos.map((guide, index) => {
              const meta = guideMeta[guide.href]
              return (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className='group flex gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40'
                >
                  <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary'>
                    <meta.icon className='h-5 w-5' />
                  </span>
                  <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='font-mono text-xs text-primary'>0{index + 2}</span>
                      <span className='rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground'>
                        {meta.hint}
                      </span>
                    </div>
                    <h3 className='font-display text-lg font-semibold tracking-tight text-foreground'>{guide.title}</h3>
                    <p className='text-sm leading-relaxed text-muted-foreground'>{guide.description}</p>
                    <span className='mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-primary'>
                      Read guide
                      <ArrowForwardIcon
                        boxSize={14}
                        className='shrink-0 transition-transform group-hover:translate-x-0.5'
                      />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className='flex flex-wrap items-center justify-between gap-5 rounded-xl border border-border p-6'>
          <div className='min-w-0 flex-1 basis-72'>
            <h2 className='font-display text-xl font-bold tracking-tight text-foreground'>Prefer to learn by doing?</h2>
            <p className='mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              The guided setup walks you from connecting a wallet to your first executed transaction and tracks your
              progress. Stuck on something the guides do not cover? Ask.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button asChild>
              <Link href='/get-started'>Open the guided setup</Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/contact'>Ask a question</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Multisig wallet guides and docs · MyMultiSig',
      description:
        'Guides to multisig wallets on EVM networks: what a multisig is, how to create one, how to propose, sign, and execute transactions, and how to import an existing wallet.',
      path: '/docs'
    }
  }
}

export default Page
