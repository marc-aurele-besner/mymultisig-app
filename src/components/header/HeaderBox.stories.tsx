import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import HeaderBox from './HeaderBox'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Header/HeaderBox',
  component: HeaderBox,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof HeaderBox>

export const Basic: ComponentStory<typeof HeaderBox> = (args) => (
  <Web3Provider>
    <HeaderBox {...args} />
  </Web3Provider>
)
