import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import PublicAddressBook from './PublicAddressBook'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof PublicAddressBook> = {
  title: 'Views/PublicAddressBook',
  component: PublicAddressBook
}

export default meta

export const Basic: StoryFn<typeof PublicAddressBook> = () => (
  <Web3Provider>
    <PublicAddressBook />
  </Web3Provider>
)
