import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MultiSigRpcPanel from './MultiSigRpcPanel'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof MultiSigRpcPanel> = {
  title: 'MultiSigDetails/MultiSigRpcPanel',
  component: MultiSigRpcPanel
}

export default meta

export const Basic: StoryFn<typeof MultiSigRpcPanel> = (args: React.ComponentProps<typeof MultiSigRpcPanel>) => (
  <Web3Provider>
    <MultiSigRpcPanel {...args} />
  </Web3Provider>
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222'
}
