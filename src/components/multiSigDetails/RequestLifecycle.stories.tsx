import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import RequestLifecycle from './RequestLifecycle'

const meta: Meta<typeof RequestLifecycle> = {
  title: 'MultiSigDetails/RequestLifecycle',
  component: RequestLifecycle
}

export default meta

export const Basic: StoryFn<typeof RequestLifecycle> = (args: React.ComponentProps<typeof RequestLifecycle>) => (
  <RequestLifecycle {...args} />
)
Basic.args = {
  signatures: 1,
  threshold: 2
}
