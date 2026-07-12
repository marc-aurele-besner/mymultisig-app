import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ImageButton from './ImageButton'

const meta: Meta<typeof ImageButton> = {
  title: 'Buttons/ImageButton',
  component: ImageButton,
}

export default meta

export const MetaMask: StoryFn<typeof ImageButton> = () => (
  <ImageButton placeholder='MetaMask' imagePath='/images/wallets/mm.png' />
)

export const CoinBaseWallet: StoryFn<typeof ImageButton> = () => (
  <ImageButton placeholder='CoinBaseWallet' imagePath='/images/wallets/cbw.png' />
)

export const WalletConnect: StoryFn<typeof ImageButton> = () => (
  <ImageButton placeholder='WalletConnect' imagePath='/images/wallets/wc.png' />
)
