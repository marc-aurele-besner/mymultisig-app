import React from 'react'

import Agents from '../components/views/Agents'

const Page: React.FC = () => {
  return <Agents />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Agents & API',
      description:
        'Let Claude, Cursor, a CI job or your own bot work a multisig request queue: MCP server, Claude Code skills, scoped REST API keys, CLI and SDK. Signing stays local and the quorum is enforced onchain.',
      path: '/agents'
    }
  }
}

export default Page
