import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowForwardIcon } from '../../components/icons/ChakraIcons'

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

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>
      <div className='flex justify-center'>
        <div className='flex w-full max-w-[900px] flex-col gap-8 py-4 md:py-8'>
          <div className='text-center'>
            <p className='mb-3 font-mono text-xs tracking-[0.2em] text-primary'>DOCS</p>
            <h1 className='mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl'>
              Guides
            </h1>
            <p className='mx-auto max-w-[640px] text-lg font-medium leading-relaxed text-foreground'>
              Short, practical guides to multisig wallets and to running one with MyMultiSig — no prior multisig
              experience assumed.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className='group flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-6 transition-colors hover:border-primary/40'
              >
                <p className='font-mono text-xs tracking-[0.2em] text-primary'>{guide.kicker}</p>
                <h2 className='font-display text-lg font-semibold tracking-tight text-foreground'>{guide.title}</h2>
                <p className='text-sm leading-relaxed text-muted-foreground'>{guide.description}</p>
                <span className='mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary'>
                  Read guide
                  <ArrowForwardIcon boxSize={14} className='shrink-0 transition-transform group-hover:translate-x-0.5' />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Guides',
      description:
        'Guides to multisig wallets on EVM networks: what a multisig is, how to create one, how to propose, sign, and execute transactions, and how to import an existing wallet.',
      path: '/docs'
    }
  }
}

export default Page
