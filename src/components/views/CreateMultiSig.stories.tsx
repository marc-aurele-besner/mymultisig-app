import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import CreateMultiSig from './CreateMultiSig'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Views/CreateMultiSig',
  component: CreateMultiSig,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof CreateMultiSig>

export const Basic: ComponentStory<typeof CreateMultiSig> = (args) => (
  <Web3Provider>
    <CreateMultiSig {...args} />
  </Web3Provider>
)
