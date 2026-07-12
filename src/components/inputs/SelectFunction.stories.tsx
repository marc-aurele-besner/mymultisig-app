import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
// import { action } from '@storybook/addon-actions' // Removed in Storybook v10
import { JsonFragment } from '@ethersproject/abi'

import SelectFunction from './SelectFunction'

const sampleAbi: JsonFragment[] = [
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }] },
]

const meta: Meta<typeof SelectFunction> = {
  title: 'Inputs/SelectFunction',
  component: SelectFunction,
}

export default meta

export const Basic: StoryFn<typeof SelectFunction> = (args: React.ComponentProps<typeof SelectFunction>) => <SelectFunction {...args} />
Basic.args = {
  abi: sampleAbi,
  onChange: () => {},
}
