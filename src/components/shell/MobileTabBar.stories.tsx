import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MobileTabBar from './MobileTabBar'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof MobileTabBar> = {
  title: 'Shell/MobileTabBar',
  component: MobileTabBar
}

export default meta

export const Basic: StoryFn<typeof MobileTabBar> = (args: React.ComponentProps<typeof MobileTabBar>) => (
  <Web3Provider>
    <MobileTabBar {...args} />
  </Web3Provider>
)
Basic.args = {
  onOpenMenu: () => {}
}
