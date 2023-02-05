import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ConnectWallet from './ConnectWallet'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Views/ConnectWallet',
  component: ConnectWallet,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof ConnectWallet>

export const Basic: ComponentStory<typeof ConnectWallet> = (args) => (
  <Web3Provider>
    <ConnectWallet {...args} />
  </Web3Provider>
)
