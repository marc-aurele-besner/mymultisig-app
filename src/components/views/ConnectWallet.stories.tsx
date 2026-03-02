import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ConnectWallet from './ConnectWallet'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof ConnectWallet> = {
  title: 'Views/ConnectWallet',
  component: ConnectWallet,
}

export default meta

export const Basic: StoryFn<typeof ConnectWallet> = (args: React.ComponentProps<typeof ConnectWallet>) => (
  <Web3Provider>
    <ConnectWallet {...args} />
  </Web3Provider>
)
