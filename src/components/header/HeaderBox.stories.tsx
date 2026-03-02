import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import HeaderBox from './HeaderBox'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof HeaderBox> = {
  title: 'Header/HeaderBox',
  component: HeaderBox,
}

export default meta

export const Basic: StoryFn<typeof HeaderBox> = (args: React.ComponentProps<typeof HeaderBox>) => (
  <Web3Provider>
    <HeaderBox {...args} />
  </Web3Provider>
)
