import React from 'react'

import SettingsLayout from '../../components/settings/SettingsLayout'
import TelegramSettings from '../../components/views/TelegramSettings'

const Page: React.FC = () => {
  return (
    <SettingsLayout>
      <TelegramSettings />
    </SettingsLayout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Telegram settings',
      description:
        'Register a Telegram bot with MyMultiSig so slash commands work in any chat where the bot is a member, and remove the bot when you no longer need it.',
      noIndex: true,
      path: '/settings/telegram'
    }
  }
}

export default Page
