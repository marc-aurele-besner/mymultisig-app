import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ImportMultiSigForm from './ImportMultiSigForm'

const meta: Meta<typeof ImportMultiSigForm> = {
  title: 'Forms/ImportMultiSig',
  component: ImportMultiSigForm,
}

export default meta

export const Basic: StoryFn<typeof ImportMultiSigForm> = (args: React.ComponentProps<typeof ImportMultiSigForm>) => <ImportMultiSigForm {...args} />
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
