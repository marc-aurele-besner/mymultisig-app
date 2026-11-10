import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AgentSettings from './AgentSettings'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof AgentSettings> = {
  title: 'Views/AgentSettings',
  component: AgentSettings
}

export default meta

export const Basic: StoryFn<typeof AgentSettings> = (args: React.ComponentProps<typeof AgentSettings>) => (
  <Web3Provider>
    <AgentSettings {...args} />
  </Web3Provider>
)
