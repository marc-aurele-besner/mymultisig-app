import React from 'react'
import Head from 'next/head'

import { useAccount } from 'wagmi'

import Inbox from '../components/views/Inbox'
import Welcome, { faqItems } from '../components/views/Welcome'
import useHasMounted from '../hooks/useHasMounted'

const siteUrl = 'https://mymultisig.app'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'MyMultiSig',
      url: `${siteUrl}/`,
      logo: `${siteUrl}/favicon/web-app-manifest-512x512.png`,
      sameAs: [
        'https://github.com/marc-aurele-besner/mymultisig-app',
        'https://github.com/marc-aurele-besner/mymultisig-contract',
        'https://www.npmjs.com/package/mymultisig-contract',
        'https://x.com/marcaureleb'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: 'MyMultiSig',
      publisher: { '@id': `${siteUrl}/#organization` }
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#app`,
      name: 'MyMultiSig',
      url: `${siteUrl}/`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description: 'Open-source multisig wallet for Ethereum and other EVM networks.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    }
  ]
}

const Page: React.FC = () => {
  // The static HTML is always the marketing page (it is what crawlers and
  // first-time visitors get). A connected wallet swaps it for the inbox.
  const hasMounted = useHasMounted()
  const { isConnected } = useAccount()
  return (
    <>
      <Head>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>
      {hasMounted && isConnected ? <Inbox /> : <Welcome />}
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig — Open-source EVM Multisig Wallet',
      description:
        'Create and manage shared multisig wallets on Ethereum and other EVM networks. Open-source, gas-conscious, and enforced onchain — no single key can move the funds.',
      path: '/'
    }
  }
}

export default Page
