import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AddressBook from './AddressBook'

const meta: Meta<typeof AddressBook> = {
  title: 'Views/AddressBook',
  component: AddressBook
}

export default meta

export const Basic: StoryFn<typeof AddressBook> = (args: React.ComponentProps<typeof AddressBook>) => (
  <AddressBook {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222'
}
