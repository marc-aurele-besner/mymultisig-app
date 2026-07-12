import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ImportMultiSig from './ImportMultiSig'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof ImportMultiSig> = {
  title: 'Views/ImportMultiSig',
  component: ImportMultiSig,
}

export default meta

export const Basic: StoryFn<typeof ImportMultiSig> = (args: React.ComponentProps<typeof ImportMultiSig>) => (
  <Web3Provider>
    <ImportMultiSig {...args} />
  </Web3Provider>
)
