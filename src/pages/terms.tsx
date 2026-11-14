import React from 'react'

import Terms from '../components/views/Terms'

const Page: React.FC = () => {
  return <Terms />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Terms and conditions · MyMultiSig',
      description: 'Terms and conditions for using the MyMultiSig web app and its open-source, unaudited multisig smart contracts on Ethereum and EVM networks.',
      path: '/terms'
    }
  }
}

export default Page
