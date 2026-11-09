import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SlackBindGuide from './SlackBindGuide'

const meta: Meta<typeof SlackBindGuide> = {
  title: 'Slack/SlackBindGuide',
  component: SlackBindGuide
}

export default meta

const workspace = {
  teamId: 'T0123ABCD',
  teamName: 'Acme Treasury',
  hasToken: true,
  botUserId: 'U0BOT',
  scope: 'commands,chat:write,chat:write.public,app_mentions:read',
  installedByWallet: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  installedAt: '2026-11-09T00:00:00Z',
  updatedAt: '2026-11-09T00:00:00Z'
}

const Template: StoryFn<typeof SlackBindGuide> = (args) => (
  <div className='max-w-2xl p-6'>
    <SlackBindGuide {...args} />
  </div>
)

// The wallet has multisigs in the app: one ready-to-paste command each.
export const WithMultisigs = Template.bind({})
WithMultisigs.args = {
  workspaces: [workspace],
  multiSigs: [
    {
      address: '0x2eE7e2fC1a4B5d3b2F9f2e7b6C8a9D0e1F2a3B4c',
      chainId: 11155111,
      chainName: 'Sepolia',
      name: 'Treasury'
    },
    {
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      chainId: 1,
      chainName: 'Ethereum',
      name: 'Ops'
    }
  ],
  onRefresh: () => {}
}

// No multisigs known yet: generic command and a link to open one.
export const WithoutMultisigs = Template.bind({})
WithoutMultisigs.args = {
  workspaces: [workspace],
  multiSigs: [],
  onRefresh: () => {}
}
