import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ProgressRing from './ProgressRing'

const meta: Meta<typeof ProgressRing> = {
  title: 'Onboarding/ProgressRing',
  component: ProgressRing
}

export default meta

export const Basic: StoryFn<typeof ProgressRing> = (args: React.ComponentProps<typeof ProgressRing>) => (
  <ProgressRing {...args} />
)
Basic.args = {
  done: 3,
  total: 7
}
