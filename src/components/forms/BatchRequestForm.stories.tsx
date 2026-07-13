import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import BatchRequestForm from './BatchRequestForm'

const meta: Meta<typeof BatchRequestForm> = {
  title: 'Forms/BatchRequestForm',
  component: BatchRequestForm,
}

export default meta

export const Basic: StoryFn<typeof BatchRequestForm> = (args: React.ComponentProps<typeof BatchRequestForm>) => (
  <BatchRequestForm {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
}
