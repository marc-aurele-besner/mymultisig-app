import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ImportMultiSig from './ImportMultiSig'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Views/ImportMultiSig',
  component: ImportMultiSig,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof ImportMultiSig>

export const Basic: ComponentStory<typeof ImportMultiSig> = (args) => (
  <Web3Provider>
    <ImportMultiSig {...args} />
  </Web3Provider>
)
