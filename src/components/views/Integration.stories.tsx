import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Integration from './Integration'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof Integration> = {
  title: 'Views/Integration',
  component: Integration,
}

export default meta

export const Basic: StoryFn<typeof Integration> = (args: React.ComponentProps<typeof Integration>) => (
  <Web3Provider>
    <Integration {...args} />
  </Web3Provider>
)
