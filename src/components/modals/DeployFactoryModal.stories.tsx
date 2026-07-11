import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import { polygon, polygonMumbai } from 'viem/chains'

import DeployFactoryModal from './DeployFactoryModal'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof DeployFactoryModal> = {
  title: 'Modals/DeployFactoryModal',
  component: DeployFactoryModal,
}

export default meta

export const Planned: StoryFn<typeof DeployFactoryModal> = () => (
  <Web3Provider>
    <DeployFactoryModal chain={polygon} status="planned" open={true} onOpenChange={() => {}} />
  </Web3Provider>
)

export const NotSupported: StoryFn<typeof DeployFactoryModal> = () => (
  <Web3Provider>
    <DeployFactoryModal chain={polygonMumbai} status="not-supported" open={true} onOpenChange={() => {}} />
  </Web3Provider>
)
