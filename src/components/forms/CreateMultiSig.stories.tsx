import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import CreateMultiSig from './CreateMultiSigForm'

export default {
  title: 'Forms/CreateMultiSig',
  component: CreateMultiSig,
} as ComponentMeta<typeof CreateMultiSig>

export const Basic: ComponentStory<typeof CreateMultiSig> = (args) => <CreateMultiSig {...args} />
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
