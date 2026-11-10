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
        'Connect Claude, Cursor or any MCP client to MyMultiSig: setup snippets for the MCP server, the Claude Code plugin and the CLI, plus the environment options.',
      noIndex: true,
      path: '/settings/agents'
    }
  }
}

export default Page
