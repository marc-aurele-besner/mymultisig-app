import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import UseYourMultiSig from './UseYourMultiSig'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof UseYourMultiSig> = {
  title: 'Views/UseYourMultiSig',
  component: UseYourMultiSig,
}

export default meta

export const Basic: StoryFn<typeof UseYourMultiSig> = (args: React.ComponentProps<typeof UseYourMultiSig>) => (
  <Web3Provider>
    <UseYourMultiSig {...args} />
  </Web3Provider>
)
