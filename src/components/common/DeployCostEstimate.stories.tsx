import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import { mainnet, polygon, sepolia } from 'viem/chains'

import DeployCostEstimate from './DeployCostEstimate'

const meta: Meta<typeof DeployCostEstimate> = {
  title: 'Common/DeployCostEstimate',
  component: DeployCostEstimate
}

export default meta

const entries = [
  { chainId: mainnet.id, name: 'Ethereum', usdPerGas: 0.000004 },
  { chainId: polygon.id, name: 'Polygon', usdPerGas: 0.000000004 }
]

const Template: StoryFn<typeof DeployCostEstimate> = (args: React.ComponentProps<typeof DeployCostEstimate>) => (
  <div className='w-[420px]'>
    <DeployCostEstimate {...args} />
  </div>
)

export const Testnet = Template.bind({})
Testnet.args = { chainId: sepolia.id, estimate: { entries, isLoading: false } }

export const MainnetEstimate = Template.bind({})
MainnetEstimate.args = { chainId: mainnet.id, walletType: 'extended', estimate: { entries, isLoading: false } }

export const MainnetFromRealGasEstimate = Template.bind({})
MainnetFromRealGasEstimate.args = { chainId: mainnet.id, gasUnits: 3_200_000, estimate: { entries, isLoading: false } }

export const Loading = Template.bind({})
Loading.args = { chainId: mainnet.id, estimate: { entries: [], isLoading: true } }

export const Unavailable = Template.bind({})
Unavailable.args = { chainId: mainnet.id, estimate: { entries: [], isLoading: false } }

export const NoChainList = Template.bind({})
NoChainList.args = { estimate: { entries, isLoading: false } }
