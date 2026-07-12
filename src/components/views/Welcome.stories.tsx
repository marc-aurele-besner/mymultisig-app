import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Welcome from './Welcome'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof Welcome> = {
  title: 'Views/Welcome',
  component: Welcome,
}

export default meta

export const Basic: StoryFn<typeof Welcome> = (args: React.ComponentProps<typeof Welcome>) => (
  <Web3Provider>
    <Welcome {...args} />
  </Web3Provider>
)
