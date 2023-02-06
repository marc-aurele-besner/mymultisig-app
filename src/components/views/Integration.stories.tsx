import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Integration from './Integration'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Views/Integration',
  component: Integration,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Integration>

export const Basic: ComponentStory<typeof Integration> = (args) => (
  <Web3Provider>
    <Integration {...args} />
  </Web3Provider>
)
