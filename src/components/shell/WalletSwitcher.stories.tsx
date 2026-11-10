import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import WalletSwitcher from './WalletSwitcher'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof WalletSwitcher> = {
  title: 'Shell/WalletSwitcher',
  component: WalletSwitcher
}

export default meta

export const Basic: StoryFn<typeof WalletSwitcher> = (args: React.ComponentProps<typeof WalletSwitcher>) => (
  <Web3Provider>
    <div className='w-64'>
      <WalletSwitcher {...args} />
    </div>
  </Web3Provider>
)
Basic.args = {
  wallet: {
    chainId: 11155111,
    chainName: 'Sepolia',
    factoryAddress: '0x5c529198e6b4d2DCBb2f3201062A7e9194298d5a',
    id: 1,
    name: 'Team Treasury',
    version: '0.5.0',
    address: '0x2222222222222222222222222222222222222222',
    threshold: 2,
    ownerCount: 3,
    nonce: 12,
    owners: ['0x1111111111111111111111111111111111111111']
  },
  wallets: [
    {
      chainId: 11155111,
      chainName: 'Sepolia',
      factoryAddress: '0x5c529198e6b4d2DCBb2f3201062A7e9194298d5a',
      id: 1,
      name: 'Team Treasury',
      version: '0.5.0',
      address: '0x2222222222222222222222222222222222222222',
      threshold: 2,
      ownerCount: 3,
      nonce: 12,
      owners: ['0x1111111111111111111111111111111111111111']
    }
  ],
  pendingByWallet: { '0x2222222222222222222222222222222222222222': 2 }
}
