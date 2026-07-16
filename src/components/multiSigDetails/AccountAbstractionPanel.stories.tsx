import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AccountAbstractionPanel from './AccountAbstractionPanel'

const meta: Meta<typeof AccountAbstractionPanel> = {
  title: 'MultiSigDetails/AccountAbstractionPanel',
  component: AccountAbstractionPanel,
}

export default meta

export const Basic: StoryFn<typeof AccountAbstractionPanel> = (
  args: React.ComponentProps<typeof AccountAbstractionPanel>
) => <AccountAbstractionPanel {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
}
