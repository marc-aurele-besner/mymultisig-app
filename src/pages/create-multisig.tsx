import React from 'react'

import CreateMultiSig from '../components/views/CreateMultiSig'

const Page: React.FC = () => {
  return <CreateMultiSig />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Create a multisig wallet on Ethereum and EVM · MyMultiSig',
      description:
        'Deploy a new multisig wallet on Ethereum or any supported EVM network. Choose the owners, set the approval threshold, and create your shared wallet in minutes.',
      path: '/create-multisig'
    }
  }
}

export default Page
