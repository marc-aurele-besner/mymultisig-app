import React from 'react'

import UseYourMultiSig from '../components/views/UseYourMultiSig'

const Page: React.FC = () => {
  return <UseYourMultiSig />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Open existing multisig',
      description:
        'Open one of your existing multisig wallets to propose, approve, and execute transactions with your co-owners.',
      path: '/open-multisig'
    }
  }
}

export default Page
