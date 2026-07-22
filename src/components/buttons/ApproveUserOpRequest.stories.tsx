import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ApproveUserOpRequest from './ApproveUserOpRequest'

const meta: Meta<typeof ApproveUserOpRequest> = {
  title: 'Buttons/ApproveUserOpRequest',
  component: ApproveUserOpRequest
}

export default meta

export const Basic: StoryFn<typeof ApproveUserOpRequest> = (
  args: React.ComponentProps<typeof ApproveUserOpRequest>
) => <ApproveUserOpRequest {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  userOpSigningHash: '0x5555555555555555555555555555555555555555555555555555555555555555'
}
