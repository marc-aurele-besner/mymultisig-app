import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MultiSigSettings from './MultiSigSettings'

const meta: Meta<typeof MultiSigSettings> = {
  title: 'Views/MultiSigSettings',
  component: MultiSigSettings,
}

export default meta

export const Basic: StoryFn<typeof MultiSigSettings> = (args: React.ComponentProps<typeof MultiSigSettings>) => (
  <MultiSigSettings {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
}
