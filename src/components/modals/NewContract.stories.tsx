import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'

import NewContract from './NewContract'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof NewContract> = {
  title: 'Modals/NewContract',
  component: NewContract,
  parameters: {
    docs: {
      description: {
        component:
          'Opens a modal to create a new contract entry. Requires a connected wallet for full interaction.'
      }
    }
  }
}

export default meta

const Template: StoryFn<typeof NewContract> = () => <NewContract />

export const Disconnected = Template.bind({})

export const WithWeb3Provider: StoryFn<typeof NewContract> = () => (
  <Web3Provider>
    <NewContract />
  </Web3Provider>
)
WithWeb3Provider.parameters = {
  docs: {
    description: {
      story:
        'Wrapped in a Wagmi provider. You may still need to connect a wallet via Storybook to fully interact.'
    }
  }
}