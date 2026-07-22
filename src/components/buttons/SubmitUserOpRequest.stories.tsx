import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SubmitUserOpRequest from './SubmitUserOpRequest'

const meta: Meta<typeof SubmitUserOpRequest> = {
  title: 'Buttons/SubmitUserOpRequest',
  component: SubmitUserOpRequest
}

export default meta

export const Basic: StoryFn<typeof SubmitUserOpRequest> = (args: React.ComponentProps<typeof SubmitUserOpRequest>) => (
  <SubmitUserOpRequest {...args} />
)
Basic.args = {
  wallet: '0x2222222222222222222222222222222222222222',
  entryPoint: '0x0000000071727De22E5E9d8BDe0dFeC0CEB6a7d7',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc',
  walletVersion: '0.5.0',
  existingRequestId: '00000000-0000-0000-0000-000000000000',
  requestDetails: {
    id: '00000000-0000-0000-0000-000000000000',
    multiSigAddress: '0x2222222222222222222222222222222222222222',
    description: 'Send 0.001 ETH via Account Abstraction',
    submitter: '0x2222222222222222222222222222222222222222',
    signatures: [],
    ownerSigners: [],
    dateSubmitted: new Date().toISOString(),
    dateExecuted: '',
    isActive: true,
    isExecuted: false,
    isCancelled: false,
    isConfirmed: false,
    isSuccessful: false,
    request: {
      to: '0x3333333333333333333333333333333333333333',
      value: '0',
      data: '0x',
      txnGas: '35000',
      signatures: '',
      mode: 'userop'
    }
  }
}
