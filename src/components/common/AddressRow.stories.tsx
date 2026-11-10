import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AddressRow from './AddressRow'

const meta: Meta<typeof AddressRow> = {
  title: 'Common/AddressRow',
  component: AddressRow
}

export default meta

export const Basic: StoryFn<typeof AddressRow> = (args: React.ComponentProps<typeof AddressRow>) => (
  <div className='w-[420px]'>
    <AddressRow {...args} />
  </div>
)
Basic.args = {
  address: '0x7A3f51c2E8b94d06A1f3bC7720e5D8a41b6f9C4e',
  label: 'ava.eth',
  isYou: true
}
