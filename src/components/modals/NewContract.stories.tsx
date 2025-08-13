import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import NewContract from './NewContract'
import Web3Provider from '../web3/Web3Provider'

export default {
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
} as ComponentMeta<typeof NewContract>

const Template: ComponentStory<typeof NewContract> = () => <NewContract />

export const Disconnected = Template.bind({})

export const WithWeb3Provider: ComponentStory<typeof NewContract> = () => (
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