import React from 'react'

import GetStarted from '../components/views/GetStarted'

const Page: React.FC = () => {
  return <GetStarted />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Get started',
      description:
        'A guided path from connecting a wallet to your first executed multisig transaction: sign in, create or import a multisig, fund it, propose, collect signatures and execute.',
      path: '/get-started'
    }
  }
}

export default Page
