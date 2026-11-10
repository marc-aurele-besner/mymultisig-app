import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Inbox from './Inbox'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof Inbox> = {
  title: 'Views/Inbox',
  component: Inbox
}

export default meta

export const Basic: StoryFn<typeof Inbox> = (args: React.ComponentProps<typeof Inbox>) => (
  <Web3Provider>
    <Inbox {...args} />
  </Web3Provider>
)
