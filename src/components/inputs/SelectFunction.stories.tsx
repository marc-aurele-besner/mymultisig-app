import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { JsonFragment } from '@ethersproject/abi'

import SelectFunction from './SelectFunction'

const sampleAbi: JsonFragment[] = [
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }] },
]

export default {
  title: 'Inputs/SelectFunction',
  component: SelectFunction,
} as ComponentMeta<typeof SelectFunction>

export const Basic: ComponentStory<typeof SelectFunction> = (args) => <SelectFunction {...args} />
Basic.args = {
  abi: sampleAbi,
  onChange: action('function-selected'),
}
