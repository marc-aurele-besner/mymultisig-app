import React from 'react'

import UseYourMultiSig from '../components/views/UseYourMultiSig'

const Page: React.FC = () => {
  return <UseYourMultiSig />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Open your multisig wallet · MyMultiSig',
      description:
        'Open one of your multisig wallets to check balances and the request queue, then propose, approve and execute transactions with your co-owners.',
      path: '/open-multisig'
    }
  }
}

export default Page
