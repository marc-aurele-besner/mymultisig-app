import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import { mainnet, sepolia } from 'viem/chains'

import TestnetFaucet from './TestnetFaucet'

const meta: Meta<typeof TestnetFaucet> = {
  title: 'Common/TestnetFaucet',
  component: TestnetFaucet
}

export default meta

const Template: StoryFn<typeof TestnetFaucet> = (args: React.ComponentProps<typeof TestnetFaucet>) => (
  <div className='w-[420px]'>
    <TestnetFaucet {...args} />
  </div>
)

export const Sepolia = Template.bind({})
Sepolia.args = {
  chainId: sepolia.id
}

export const MainnetSuggestTestnet = Template.bind({})
MainnetSuggestTestnet.args = {
  chainId: mainnet.id,
  suggestTestnet: true
}
