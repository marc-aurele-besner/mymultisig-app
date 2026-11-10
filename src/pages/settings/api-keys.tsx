import React from 'react'

import SettingsLayout from '../../components/settings/SettingsLayout'
import ApiKeySettings from '../../components/views/ApiKeySettings'

const Page: React.FC = () => {
  return (
    <SettingsLayout>
      <ApiKeySettings />
    </SettingsLayout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - API keys',
      description:
        'Create, list and revoke scoped API keys for the MyMultiSig REST API, CLI, SDK and AI agents. Keys can be limited to specific multisigs and given an expiry.',
      noIndex: true,
      path: '/settings/api-keys'
    }
  }
}

export default Page
