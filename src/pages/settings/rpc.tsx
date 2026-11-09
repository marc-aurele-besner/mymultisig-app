import React from 'react'

import RpcSettings from '../../components/views/RpcSettings'

const Page: React.FC = () => {
  return <RpcSettings />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - RPC settings',
      description:
        'Use your own RPC endpoint instead of the public one, per connected wallet or per multisig, to avoid rate limits.',
      path: '/settings/rpc'
    }
  }
}

export default Page
