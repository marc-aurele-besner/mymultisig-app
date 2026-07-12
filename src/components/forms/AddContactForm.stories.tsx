import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AddContactForm from './AddContactForm'

const meta: Meta<typeof AddContactForm> = {
  title: 'Forms/AddContactForm',
  component: AddContactForm,
}

export default meta

export const Basic: StoryFn<typeof AddContactForm> = (args: React.ComponentProps<typeof AddContactForm>) => <AddContactForm {...args} />
Basic.args = {
  contract: {
    chainId: 5,
    chainName: 'Goerli',
    id: 'contract-1',
    name: '',
    address: '0x0000000000000000000000000000000000000000',
    creator: '0x0000000000000000000000000000000000000000',
    abi: [],
    isMultiSig: false,
    isPublic: false,
    isVerified: false,
    isWhitelisted: false,
    isChainSpecific: false,
    isWalletSpecific: false,
  },
  setContract: () => {},
}
