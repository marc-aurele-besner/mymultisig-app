import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MultiSigList from './MultiSigList'

const meta: Meta<typeof MultiSigList> = {
  title: 'MultiSigDetails/MultiSigList',
  component: MultiSigList,
}

export default meta

export const Basic: StoryFn<typeof MultiSigList> = (args: React.ComponentProps<typeof MultiSigList>) => (
  <MultiSigList {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  address: '0x3333333333333333333333333333333333333333',
  multiSig: {
    chainId: 1,
    chainName: 'Ethereum',
    factoryAddress: '0x1111111111111111111111111111111111111111',
    id: 0,
    name: 'Treasury',
    version: '0.5.0',
    address: '0x2222222222222222222222222222222222222222',
    threshold: 2,
    ownerCount: 3,
    nonce: 4,
    owners: [
      '0x3333333333333333333333333333333333333333',
      '0x4444444444444444444444444444444444444444',
      '0x5555555555555555555555555555555555555555',
    ],
    isDeployed: true,
    walletType: 'extended',
    allowOnlyOwnerRequest: false,
  },
}
