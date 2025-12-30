import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import ExecuteRequest from './ExecuteRequest'
import Web3Provider from '../web3/Web3Provider'

export default {
  title: 'Buttons/ExecuteRequest',
  component: ExecuteRequest
} as ComponentMeta<typeof ExecuteRequest>

const multiSigAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`
const toAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`

export const Basic: ComponentStory<typeof ExecuteRequest> = () => (
  <Web3Provider>
    <ExecuteRequest
      multiSigAddress={multiSigAddress}
      args={{ to: toAddress, value: '0', data: '0x', txnGas: '35000', signatures: '' }}
      requestDetails={{
        id: 'REQ-123',
        multiSigAddress,
        request: { to: toAddress, value: '0', data: '0x', txnGas: '35000', signatures: '' },
        description: 'Test request',
        submitter: toAddress,
        signatures: [],
        ownerSigners: [],
        dateSubmitted: new Date().toISOString(),
        dateExecuted: '',
        isActive: true,
        isExecuted: false,
        isCancelled: false,
        isConfirmed: false,
        isSuccessful: false,
      }}
      existingRequestRef={'REQ-123'}
    />
  </Web3Provider>
)