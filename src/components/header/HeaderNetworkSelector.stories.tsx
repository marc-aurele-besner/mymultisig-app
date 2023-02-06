import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import HeaderNetworkSelector from './HeaderNetworkSelector'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Header/HeaderNetworkSelector',
  component: HeaderNetworkSelector,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof HeaderNetworkSelector>

export const Basic: ComponentStory<typeof HeaderNetworkSelector> = (args) => (
  <Web3Provider>
    <HeaderNetworkSelector {...args} />
  </Web3Provider>
)
