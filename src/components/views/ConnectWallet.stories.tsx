import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ConnectWallet from './ConnectWallet'

export default {
  title: 'Views/ConnectWallet',
  component: ConnectWallet,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof ConnectWallet>

export const Basic: ComponentStory<typeof ConnectWallet> = (args) => <ConnectWallet {...args} />
