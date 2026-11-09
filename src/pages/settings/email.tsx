import React from 'react'

import EmailSettings from '../../components/views/EmailSettings'

const Page: React.FC = () => {
  return <EmailSettings />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Email settings',
      description:
        'Set the inbox that receives signature requests and ready-to-execute notifications for the multisig wallets you own.',
      path: '/settings/email'
    }
  }
}

export default Page
