import React from 'react'

import SettingsLayout from '../../components/settings/SettingsLayout'
import EmailSettings from '../../components/views/EmailSettings'

const Page: React.FC = () => {
  return (
    <SettingsLayout>
      <EmailSettings />
    </SettingsLayout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Email settings',
      description:
        'Set the inbox that receives signature requests and ready-to-execute notifications for the multisig wallets you own.',
      noIndex: true,
      path: '/settings/email'
    }
  }
}

export default Page
