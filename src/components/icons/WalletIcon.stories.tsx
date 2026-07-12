import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'

import { WalletIcon } from './wallet'

const meta: Meta<typeof WalletIcon> = {
  title: 'Icons/Wallet',
  component: WalletIcon,
  argTypes: {
    color: { control: 'color' },
    width: { control: 'text' },
    height: { control: 'text' }
  }
}

export default meta

const Template: StoryFn<typeof WalletIcon> = (args: React.ComponentProps<typeof WalletIcon>) => <WalletIcon {...args} />

export const Basic = Template.bind({})
Basic.args = {
  color: '#1a365d',
  width: '48px',
  height: '48px'
}