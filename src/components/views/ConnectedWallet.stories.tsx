import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ConnectedWallet from './ConnectedWallet'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Views/ConnectedWallet',
  component: ConnectedWallet,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof ConnectedWallet>

export const Basic: ComponentStory<typeof ConnectedWallet> = (args) => (
  <Web3Provider>
    <ConnectedWallet {...args} />
  </Web3Provider>
)
