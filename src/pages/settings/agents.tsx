import React from 'react'

import SettingsLayout from '../../components/settings/SettingsLayout'
import AgentSettings from '../../components/views/AgentSettings'

const Page: React.FC = () => {
  return (
    <SettingsLayout>
      <AgentSettings />
    </SettingsLayout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - AI agents',
      description:
        'Create scoped API keys so AI agents can read your multisigs and queue requests through the MyMultiSig MCP server, CLI or SDK.',
      path: '/settings/agents'
    }
  }
}

export default Page
