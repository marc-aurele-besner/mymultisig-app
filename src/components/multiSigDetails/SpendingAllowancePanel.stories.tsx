import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SpendingAllowancePanel from './SpendingAllowancePanel'

const meta: Meta<typeof SpendingAllowancePanel> = {
  title: 'MultiSigDetails/SpendingAllowancePanel',
  component: SpendingAllowancePanel,
}

export default meta

export const Basic: StoryFn<typeof SpendingAllowancePanel> = (
  args: React.ComponentProps<typeof SpendingAllowancePanel>
) => <SpendingAllowancePanel {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
}
