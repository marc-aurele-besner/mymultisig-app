import React from 'react'

import SettingsLayout from '../../components/settings/SettingsLayout'
import SlackSettings from '../../components/views/SlackSettings'

const Page: React.FC = () => {
  return (
    <SettingsLayout>
      <SlackSettings />
    </SettingsLayout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Slack settings',
      description:
        'Install the MyMultiSig Slack app, list the workspaces connected to your wallet, and uninstall when you no longer need it.',
      path: '/settings/slack'
    }
  }
}

export default Page
