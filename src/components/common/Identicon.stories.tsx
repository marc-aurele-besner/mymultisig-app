import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Identicon from './Identicon'

const meta: Meta<typeof Identicon> = {
  title: 'Common/Identicon',
  component: Identicon
}

export default meta

export const Basic: StoryFn<typeof Identicon> = (args: React.ComponentProps<typeof Identicon>) => (
  <Identicon {...args} />
)
Basic.args = {
  value: '0x7A3f51c2E8b94d06A1f3bC7720e5D8a41b6f9C4e',
  size: 48
}
