import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import TopBar from './TopBar'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof TopBar> = {
  title: 'Shell/TopBar',
  component: TopBar
}

export default meta

export const Basic: StoryFn<typeof TopBar> = (args: React.ComponentProps<typeof TopBar>) => (
  <Web3Provider>
    <div className='w-[900px]'>
      <TopBar {...args} />
    </div>
  </Web3Provider>
)
Basic.args = {
  onOpenPalette: () => {}
}
