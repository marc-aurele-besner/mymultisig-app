import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MultiSigOverview from './MultiSigOverview'

const meta: Meta<typeof MultiSigOverview> = {
  title: 'MultiSigDetails/MultiSigOverview',
  component: MultiSigOverview
}

export default meta

export const Basic: StoryFn<typeof MultiSigOverview> = (args: React.ComponentProps<typeof MultiSigOverview>) => (
  <MultiSigOverview {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222'
}
