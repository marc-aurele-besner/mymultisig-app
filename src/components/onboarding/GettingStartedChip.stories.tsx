import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import GettingStartedChip from './GettingStartedChip'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof GettingStartedChip> = {
  title: 'Onboarding/GettingStartedChip',
  component: GettingStartedChip
}

export default meta

export const Basic: StoryFn<typeof GettingStartedChip> = (args: React.ComponentProps<typeof GettingStartedChip>) => (
  <Web3Provider>
    <div className='w-64'>
      <GettingStartedChip {...args} />
    </div>
  </Web3Provider>
)
