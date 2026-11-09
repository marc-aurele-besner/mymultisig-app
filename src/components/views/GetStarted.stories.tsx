import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import GetStarted from './GetStarted'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof GetStarted> = {
  title: 'Views/GetStarted',
  component: GetStarted
}

export default meta

export const Basic: StoryFn<typeof GetStarted> = (args: React.ComponentProps<typeof GetStarted>) => (
  <Web3Provider>
    <GetStarted {...args} />
  </Web3Provider>
)
