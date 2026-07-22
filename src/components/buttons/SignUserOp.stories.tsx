import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SignUserOp from './SignUserOp'

const meta: Meta<typeof SignUserOp> = {
  title: 'Buttons/SignUserOp',
  component: SignUserOp
}

export default meta

export const Basic: StoryFn<typeof SignUserOp> = (args: React.ComponentProps<typeof SignUserOp>) => (
  <SignUserOp {...args} />
)
Basic.args = {
  wallet: '0x2222222222222222222222222222222222222222',
  entryPoint: '0x0000000071727De22E5E9d8BDe0dFeC0CEB6a7d7',
  nonce: 0n,
  args: {
    to: '0x3333333333333333333333333333333333333333',
    value: '0',
    data: '0x',
    txnGas: '35000',
    signatures: ''
  },
  description: 'Send 0.001 ETH via Account Abstraction'
}
