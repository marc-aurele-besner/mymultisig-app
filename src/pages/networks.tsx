import React from 'react'
import Head from 'next/head'

import Networks from '../components/views/Networks'
import networks from '../constants/networks'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'EVM networks supported by MyMultiSig',
  itemListElement: networks.map((chain, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: chain.name
  }))
}

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>
      <Networks />
    </>
  )
}

export async function getStaticProps() {
  const mainnetNames = networks
    .filter((chain) => !chain.testnet)
    .map((chain) => chain.name)
    .join(', ')
  return {
    props: {
      title: 'MyMultiSig - Supported networks',
      description: `Deploy a multisig wallet on ${networks.length} EVM networks — ${mainnetNames} — plus their testnets. Same open-source contract everywhere.`,
      path: '/networks'
    }
  }
}

export default Page
