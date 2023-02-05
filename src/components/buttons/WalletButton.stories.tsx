import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import WalletButton from './WalletButton'

export default {
  title: 'Buttons/WalletButton',
  component: WalletButton,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof WalletButton>

export const MetaMask: ComponentStory<typeof WalletButton> = () => (
  <WalletButton placeholder='MetaMask' imagePath='/images/wallets/mm.png' />
)

export const CoinBaseWallet: ComponentStory<typeof WalletButton> = () => (
  <WalletButton placeholder='CoinBaseWallet' imagePath='/images/wallets/cbw.png' />
)

export const WalletConnect: ComponentStory<typeof WalletButton> = () => (
  <WalletButton placeholder='WalletConnect' imagePath='/images/wallets/wc.png' />
)
