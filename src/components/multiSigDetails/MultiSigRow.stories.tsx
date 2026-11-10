import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MultiSigRow from './MultiSigRow'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof MultiSigRow> = {
  title: 'MultiSigDetails/MultiSigRow',
  component: MultiSigRow
}

export default meta

export const Basic: StoryFn<typeof MultiSigRow> = (args: React.ComponentProps<typeof MultiSigRow>) => (
  <Web3Provider>
    <div className='w-[900px] rounded-xl border border-border bg-card'>
      <MultiSigRow {...args} />
    </div>
  </Web3Provider>
)
Basic.args = {
  pending: 2,
  viewOnly: false,
  onOpen: () => {},
  multiSig: {
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
    owners: ['0x7A3f51c2E8b94d06A1f3bC7720e5D8a41b6f9C4e']
  }
}
