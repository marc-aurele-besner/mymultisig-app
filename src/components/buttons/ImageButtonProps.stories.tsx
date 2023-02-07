import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ImageButton from './ImageButton'

export default {
  title: 'Buttons/ImageButton',
  component: ImageButton,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof ImageButton>

export const MetaMask: ComponentStory<typeof ImageButton> = () => (
  <ImageButton placeholder='MetaMask' imagePath='/images/wallets/mm.png' />
)

export const CoinBaseWallet: ComponentStory<typeof ImageButton> = () => (
  <ImageButton placeholder='CoinBaseWallet' imagePath='/images/wallets/cbw.png' />
)

export const WalletConnect: ComponentStory<typeof ImageButton> = () => (
  <ImageButton placeholder='WalletConnect' imagePath='/images/wallets/wc.png' />
)
