import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SidebarNav from './SidebarNav'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof SidebarNav> = {
  title: 'Shell/SidebarNav',
  component: SidebarNav
}

export default meta

export const Basic: StoryFn<typeof SidebarNav> = (args: React.ComponentProps<typeof SidebarNav>) => (
  <Web3Provider>
    <div className='h-[640px] w-64'>
      <SidebarNav {...args} />
    </div>
  </Web3Provider>
)
