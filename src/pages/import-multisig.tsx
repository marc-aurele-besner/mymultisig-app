import React from 'react'

import ImportMultiSig from '../components/views/ImportMultiSig'

const Page: React.FC = () => {
  return <ImportMultiSig />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Import an existing multisig wallet · MyMultiSig',
      description: 'Import an existing MyMultiSig wallet by its address to track balances, propose transactions and collect owner signatures from any device.',
      path: '/import-multisig'
    }
  }
}

export default Page
