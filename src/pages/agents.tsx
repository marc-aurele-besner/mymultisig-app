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
        'Let Claude, Cursor or your own bot work a multisig queue via MCP, Claude Code skills, scoped API keys, CLI and SDK. Signing stays local; quorum is enforced onchain.',
      path: '/agents'
    }
  }
}

export default Page
