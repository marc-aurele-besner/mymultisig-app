import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ConnectPrompt from './ConnectPrompt'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof ConnectPrompt> = {
  title: 'MultiSigDetails/ConnectPrompt',
  component: ConnectPrompt
}

export default meta

export const Basic: StoryFn<typeof ConnectPrompt> = (args: React.ComponentProps<typeof ConnectPrompt>) => (
  <Web3Provider>
    <ConnectPrompt {...args} />
  </Web3Provider>
)
Basic.args = {
  what: 'this multisig'
}
