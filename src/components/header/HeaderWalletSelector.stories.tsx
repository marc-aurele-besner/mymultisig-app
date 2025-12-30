import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import { HeaderWalletSelector } from './HeaderWalletSelector'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Header/WalletSelector',
  component: HeaderWalletSelector
} as ComponentMeta<typeof HeaderWalletSelector>

export const Basic: ComponentStory<typeof HeaderWalletSelector> = () => (
  <Web3Provider>
    <HeaderWalletSelector />
  </Web3Provider>
)