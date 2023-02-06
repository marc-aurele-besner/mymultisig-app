import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import UseYourMultiSig from './UseYourMultiSig'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Views/UseYourMultiSig',
  component: UseYourMultiSig,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof UseYourMultiSig>

export const Basic: ComponentStory<typeof UseYourMultiSig> = (args) => (
  <Web3Provider>
    <UseYourMultiSig {...args} />
  </Web3Provider>
)
