import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import CreateMultiSig from './CreateMultiSig'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof CreateMultiSig> = {
  title: 'Views/CreateMultiSig',
  component: CreateMultiSig,
}

export default meta

export const Basic: StoryFn<typeof CreateMultiSig> = (args: React.ComponentProps<typeof CreateMultiSig>) => (
  <Web3Provider>
    <CreateMultiSig {...args} />
  </Web3Provider>
)
