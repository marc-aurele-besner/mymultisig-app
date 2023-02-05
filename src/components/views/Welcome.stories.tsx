import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Welcome from './Welcome'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Views/Welcome',
  component: Welcome,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Welcome>

export const Basic: ComponentStory<typeof Welcome> = (args) => (
  <Web3Provider>
    <Welcome {...args} />
  </Web3Provider>
)
