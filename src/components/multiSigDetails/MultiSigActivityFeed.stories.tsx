import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MultiSigActivityFeed from './MultiSigActivityFeed'

const meta: Meta<typeof MultiSigActivityFeed> = {
  title: 'MultiSigDetails/MultiSigActivityFeed',
  component: MultiSigActivityFeed
}

export default meta

export const Basic: StoryFn<typeof MultiSigActivityFeed> = (
  args: React.ComponentProps<typeof MultiSigActivityFeed>
) => <MultiSigActivityFeed {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222'
}
