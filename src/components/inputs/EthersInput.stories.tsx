import React, { useState } from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import EthersInput from './EthersInput'

const meta: Meta<typeof EthersInput> = {
  title: 'Inputs/EthersInput',
  component: EthersInput,
}
export default meta

export const Basic: StoryFn<typeof EthersInput> = (args: React.ComponentProps<typeof EthersInput>) => {
  const [value, setValue] = useState('')
  return <EthersInput {...args} value={value} onChange={setValue} />
}
Basic.args = {
  symbol: 'ETH',
  helperText: 'Daily cap, set to 0 to remove the allowance'
}

export const WithMax: StoryFn<typeof EthersInput> = (args: React.ComponentProps<typeof EthersInput>) => {
  const [value, setValue] = useState('')
  return <EthersInput {...args} value={value} onChange={setValue} />
}
WithMax.args = {
  symbol: 'ETH',
  // 1.25 ETH expressed in wei: Max fills the field with exactly this amount.
  balanceHint: 1250000000000000000n,
  helperText: 'Wallet balance: 1.25 ETH'
}
