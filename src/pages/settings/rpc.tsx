import React from 'react'

import SettingsLayout from '../../components/settings/SettingsLayout'
import RpcSettings from '../../components/views/RpcSettings'

const Page: React.FC = () => {
  return (
    <SettingsLayout>
      <RpcSettings />
    </SettingsLayout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - RPC settings',
      description:
        'Use your own RPC endpoint instead of the public one, per connected wallet or per multisig, to avoid rate limits.',
      noIndex: true,
      path: '/settings/rpc'
    }
  }
}

export default Page
