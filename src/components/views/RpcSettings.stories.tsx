import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import RpcSettings from './RpcSettings'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof RpcSettings> = {
  title: 'Views/RpcSettings',
  component: RpcSettings
}

export default meta

// Without a connected wallet the page shows the connect prompt and the
// (local) list of per-multisig URLs.
export const Basic: StoryFn<typeof RpcSettings> = (args: React.ComponentProps<typeof RpcSettings>) => (
  <Web3Provider>
    <RpcSettings {...args} />
  </Web3Provider>
)
