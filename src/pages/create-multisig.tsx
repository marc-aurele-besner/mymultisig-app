import React from 'react'

import CreateMultiSig from '../components/views/CreateMultiSig'

const Page: React.FC = () => {
  return <CreateMultiSig />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Create a multisig',
      description:
        'Deploy a new multisig wallet on Ethereum or any supported EVM network. Choose the owners, set the approval threshold, and create your shared wallet in minutes.',
      path: '/create-multisig'
    }
  }
}

export default Page
