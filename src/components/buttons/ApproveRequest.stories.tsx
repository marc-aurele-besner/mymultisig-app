import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ApproveRequest from './ApproveRequest'

const meta: Meta<typeof ApproveRequest> = {
  title: 'Buttons/ApproveRequest',
  component: ApproveRequest,
}

export default meta

export const Basic: StoryFn<typeof ApproveRequest> = (args: React.ComponentProps<typeof ApproveRequest>) => (
  <ApproveRequest {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  txHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
}
