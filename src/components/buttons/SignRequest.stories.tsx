import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import SignRequest from './SignRequest'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Buttons/SignRequest',
  component: SignRequest
} as ComponentMeta<typeof SignRequest>

const multiSigAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`
const toAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`

export const Basic: ComponentStory<typeof SignRequest> = () => (
  <Web3Provider>
    <SignRequest
      multiSigAddress={multiSigAddress}
      description={'Test transaction'}
      args={{ to: toAddress, value: '0', data: '0x', txnGas: '35000', signatures: '' }}
    />
  </Web3Provider>
)