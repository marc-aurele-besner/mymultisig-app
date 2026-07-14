import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MultiSigNav from './MultiSigNav'

const meta: Meta<typeof MultiSigNav> = {
  title: 'MultiSigDetails/MultiSigNav',
  component: MultiSigNav
}

export default meta

export const Basic: StoryFn<typeof MultiSigNav> = (args: React.ComponentProps<typeof MultiSigNav>) => (
  <MultiSigNav {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222'
}
