import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ExtendedGovernancePanel from './ExtendedGovernancePanel'

const meta: Meta<typeof ExtendedGovernancePanel> = {
  title: 'MultiSigDetails/ExtendedGovernancePanel',
  component: ExtendedGovernancePanel,
}

export default meta

export const Basic: StoryFn<typeof ExtendedGovernancePanel> = (
  args: React.ComponentProps<typeof ExtendedGovernancePanel>
) => <ExtendedGovernancePanel {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  owners: [
    '0x3333333333333333333333333333333333333333',
    '0x4444444444444444444444444444444444444444',
  ],
}
