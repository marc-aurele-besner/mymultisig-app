import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ImportMultiSigForm from './ImportMultiSigForm'

export default {
  title: 'Forms/ImportMultiSig',
  component: ImportMultiSigForm,
} as ComponentMeta<typeof ImportMultiSigForm>

export const Basic: ComponentStory<typeof ImportMultiSigForm> = (args) => <ImportMultiSigForm {...args} />
Basic.args = {
  factory: {
    chainId: 5,
    chainName: 'Goerli',
    address: '0x1111111111111111111111111111111111111111',
    name: 'MyMultiSigFactory',
    version: '1.0.0',
    multiSigCount: 0,
  },
}
