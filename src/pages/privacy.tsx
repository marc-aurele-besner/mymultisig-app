import React from 'react'

import Privacy from '../components/views/Privacy'

const Page: React.FC = () => {
  return <Privacy />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Privacy policy · MyMultiSig',
      description: 'Privacy policy for MyMultiSig: what the multisig app stores (wallets, requests, signatures), how that data is used, and what stays onchain.',
      path: '/privacy'
    }
  }
}

export default Page
