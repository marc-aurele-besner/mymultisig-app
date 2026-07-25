import React from 'react'

import TelegramSettings from '../../components/views/TelegramSettings'

const Page: React.FC = () => {
  return <TelegramSettings />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Telegram settings',
      description:
        'Register a Telegram bot with MyMultiSig so slash commands work in any chat where the bot is a member, and remove the bot when you no longer need it.',
      path: '/settings/telegram'
    }
  }
}

export default Page
