import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MultiSigAssets from './MultiSigAssets'

const meta: Meta<typeof MultiSigAssets> = {
  title: 'MultiSigDetails/MultiSigAssets',
  component: MultiSigAssets
}

export default meta

export const Basic: StoryFn<typeof MultiSigAssets> = (args: React.ComponentProps<typeof MultiSigAssets>) => (
  <MultiSigAssets {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222'
}
