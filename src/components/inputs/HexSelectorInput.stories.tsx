import React, { useState } from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import type { Abi } from 'viem'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import HexSelectorInput from './HexSelectorInput'

const meta: Meta<typeof HexSelectorInput> = {
  title: 'Inputs/HexSelectorInput',
  component: HexSelectorInput,
}
export default meta

export const Basic: StoryFn<typeof HexSelectorInput> = (args: React.ComponentProps<typeof HexSelectorInput>) => {
  const [value, setValue] = useState('')
  return <HexSelectorInput {...args} value={value} onChange={setValue} />
}
Basic.args = {
  abis: [MyMultiSig as Abi],
  helperText: 'The wallet pre-registers its own admin selectors at deployment'
}
