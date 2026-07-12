import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ConnectedWallet from './ConnectedWallet'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof ConnectedWallet> = {
  title: 'Views/ConnectedWallet',
  component: ConnectedWallet,
}

export default meta

export const Basic: StoryFn<typeof ConnectedWallet> = (args: React.ComponentProps<typeof ConnectedWallet>) => (
  <Web3Provider>
    <ConnectedWallet {...args} />
  </Web3Provider>
)
