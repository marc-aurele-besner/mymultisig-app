import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import CreateMultiSig from './CreateMultiSigForm'

const meta: Meta<typeof CreateMultiSig> = {
  title: 'Forms/CreateMultiSig',
  component: CreateMultiSig,
}

export default meta

export const Basic: StoryFn<typeof CreateMultiSig> = (args: React.ComponentProps<typeof CreateMultiSig>) => <CreateMultiSig {...args} />
Basic.args = {
  owner01: '0x0000000000000000000000000000000000000000',
  factory: {
    chainId: 5,
    chainName: 'Goerli',
    address: '0x1111111111111111111111111111111111111111',
    name: 'MyMultiSigFactory',
    version: '1.0.0',
    multiSigCount: 1,
  },
}
