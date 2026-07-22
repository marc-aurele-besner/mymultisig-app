import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import RevokeUserOpApproval from './RevokeUserOpApproval'

const meta: Meta<typeof RevokeUserOpApproval> = {
  title: 'Buttons/RevokeUserOpApproval',
  component: RevokeUserOpApproval
}

export default meta

export const Basic: StoryFn<typeof RevokeUserOpApproval> = (
  args: React.ComponentProps<typeof RevokeUserOpApproval>
) => <RevokeUserOpApproval {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  userOpSigningHash: '0x5555555555555555555555555555555555555555555555555555555555555555'
}
