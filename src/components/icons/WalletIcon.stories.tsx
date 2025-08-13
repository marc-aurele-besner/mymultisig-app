import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import { WalletIcon } from './wallet'

export default {
  title: 'Icons/Wallet',
  component: WalletIcon,
  argTypes: {
    color: { control: 'color' },
    width: { control: 'text' },
    height: { control: 'text' }
  }
} as ComponentMeta<typeof WalletIcon>

const Template: ComponentStory<typeof WalletIcon> = (args) => <WalletIcon {...args} />

export const Basic = Template.bind({})
Basic.args = {
  color: '#1a365d',
  width: '48px',
  height: '48px'
}