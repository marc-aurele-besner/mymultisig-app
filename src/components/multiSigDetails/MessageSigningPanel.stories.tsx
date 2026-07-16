import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MessageSigningPanel from './MessageSigningPanel'

const meta: Meta<typeof MessageSigningPanel> = {
  title: 'MultiSigDetails/MessageSigningPanel',
  component: MessageSigningPanel,
}

export default meta

export const Basic: StoryFn<typeof MessageSigningPanel> = (
  args: React.ComponentProps<typeof MessageSigningPanel>
) => <MessageSigningPanel {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
}
