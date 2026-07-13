import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import DiscoverMultiSigs from './DiscoverMultiSigs'

const meta: Meta<typeof DiscoverMultiSigs> = {
  title: 'Forms/DiscoverMultiSigs',
  component: DiscoverMultiSigs,
}

export default meta

export const Basic: StoryFn<typeof DiscoverMultiSigs> = (args: React.ComponentProps<typeof DiscoverMultiSigs>) => (
  <DiscoverMultiSigs {...args} />
)
Basic.args = {
  factory: {
    chainId: 5,
    chainName: 'Goerli',
    address: '0x1111111111111111111111111111111111111111',
    name: 'MyMultiSigFactory',
    version: '0.1.1',
    multiSigCount: 0,
  },
}
