import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'

import SignRequest from './SignRequest'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof SignRequest> = {
  title: 'Buttons/SignRequest',
  component: SignRequest
}

export default meta

const multiSigAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`
const toAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`

export const Basic: StoryFn<typeof SignRequest> = () => (
  <Web3Provider>
    <SignRequest
      multiSigAddress={multiSigAddress}
      description={'Test transaction'}
      args={{ to: toAddress, value: '0', data: '0x', txnGas: '35000', signatures: '' }}
    />
  </Web3Provider>
)