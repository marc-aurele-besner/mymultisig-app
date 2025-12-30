import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import AddContactForm from './AddContactForm'

export default {
  title: 'Forms/AddContactForm',
  component: AddContactForm,
} as ComponentMeta<typeof AddContactForm>

export const Basic: ComponentStory<typeof AddContactForm> = (args) => <AddContactForm {...args} />
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
