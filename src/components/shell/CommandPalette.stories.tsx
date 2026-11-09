import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import CommandPalette from './CommandPalette'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof CommandPalette> = {
  title: 'Shell/CommandPalette',
  component: CommandPalette
}

export default meta

export const Basic: StoryFn<typeof CommandPalette> = (args: React.ComponentProps<typeof CommandPalette>) => (
  <Web3Provider>
    <CommandPalette {...args} />
  </Web3Provider>
)
Basic.args = {
  open: true,
  onOpenChange: () => {}
}
