import React from 'react'

import ImportMultiSig from '../components/views/ImportMultiSig'

const Page: React.FC = () => {
  return <ImportMultiSig />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Import your MultiSig',
      description: 'Import an existing multisig wallet by address to track and manage it with MyMultiSig.',
      path: '/import-multisig'
    }
  }
}

export default Page
