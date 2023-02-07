import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import FooterBox from './FooterBox'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Footer/FooterBox',
  component: FooterBox,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof FooterBox>

export const Basic: ComponentStory<typeof FooterBox> = (args) => (
  <Web3Provider>
    <FooterBox {...args} />
  </Web3Provider>
)
