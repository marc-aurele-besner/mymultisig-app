import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import RevokeApproval from './RevokeApproval'

const meta: Meta<typeof RevokeApproval> = {
  title: 'Buttons/RevokeApproval',
  component: RevokeApproval,
}

export default meta

export const Basic: StoryFn<typeof RevokeApproval> = (args: React.ComponentProps<typeof RevokeApproval>) => (
  <RevokeApproval {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
}
