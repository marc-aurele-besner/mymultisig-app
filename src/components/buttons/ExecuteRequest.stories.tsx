import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'

import ExecuteRequest from './ExecuteRequest'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof ExecuteRequest> = {
  title: 'Buttons/ExecuteRequest',
  component: ExecuteRequest
}

export default meta

const multiSigAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`
const toAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`

export const Basic: StoryFn<typeof ExecuteRequest> = () => (
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
      existingRequestId={'REQ-123'}
    />
  </Web3Provider>
)