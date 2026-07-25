import React from 'react'

import DiscordSettings from '../../components/views/DiscordSettings'

const Page: React.FC = () => {
  return <DiscordSettings />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Discord settings',
      description:
        'Add the MyMultiSig Discord bot to a server, list the servers connected to your wallet, and remove the bot when you no longer need it.',
      path: '/settings/discord'
    }
  }
}

export default Page
