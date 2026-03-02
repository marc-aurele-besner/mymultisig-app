import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import HeaderNetworkSelector from './HeaderNetworkSelector'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof HeaderNetworkSelector> = {
  title: 'Header/HeaderNetworkSelector',
  component: HeaderNetworkSelector,
}

export default meta

export const Basic: StoryFn<typeof HeaderNetworkSelector> = (args: React.ComponentProps<typeof HeaderNetworkSelector>) => (
  <Web3Provider>
    <HeaderNetworkSelector {...args} />
  </Web3Provider>
)
