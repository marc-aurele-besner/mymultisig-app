import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import FundFromExchange from './FundFromExchange'

const meta: Meta<typeof FundFromExchange> = {
  title: 'Common/FundFromExchange',
  component: FundFromExchange
}

export default meta

const Template: StoryFn<typeof FundFromExchange> = (args: React.ComponentProps<typeof FundFromExchange>) => (
  <div className='w-[420px]'>
    <FundFromExchange {...args} />
  </div>
)

export const ArbitrumOne = Template.bind({})
ArbitrumOne.args = {
  address: '0x5c529c5Bc4F3bA1F4fC5F7b2f2bEe2B9f7C6a1D3',
  chain: 42161
}

export const Testnet = Template.bind({})
Testnet.args = {
  address: '0x5c529c5Bc4F3bA1F4fC5F7b2f2bEe2B9f7C6a1D3',
  chain: 11155111
}

export const NoWalletYet = Template.bind({})
NoWalletYet.args = {}
