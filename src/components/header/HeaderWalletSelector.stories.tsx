import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'

import { HeaderWalletSelector } from './HeaderWalletSelector'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof React> = {
  title: 'Header/WalletSelector',
  component: HeaderWalletSelector
} as Meta<typeof HeaderWalletSelector>

export const Basic: StoryFn<typeof HeaderWalletSelector> = () => (
  <Web3Provider>
    <HeaderWalletSelector />
  </Web3Provider>
)