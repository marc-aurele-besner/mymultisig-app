import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import UserOpRequestCard from './UserOpRequestCard'
import { MultiSigTransactionRequest } from '../../models/MultiSigs'

const meta: Meta<typeof UserOpRequestCard> = {
  title: 'MultiSig/UserOpRequestCard',
  component: UserOpRequestCard
}

export default meta

const sampleRequest: MultiSigTransactionRequest = {
  id: '00000000-0000-0000-0000-000000000000',
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  description: 'Send 0.001 ETH via Account Abstraction',
  submitter: '0x2222222222222222222222222222222222222222',
  signatures: ['0x'],
  ownerSigners: ['0x2222222222222222222222222222222222222222'],
  dateSubmitted: new Date().toISOString(),
  dateExecuted: '',
  isActive: true,
  isExecuted: false,
  isCancelled: false,
  isConfirmed: false,
  isSuccessful: false,
  request: {
    to: '0x3333333333333333333333333333333333333333',
    value: '1000000000000000',
    data: '0x',
    txnGas: '35000',
    signatures: '0x',
    mode: 'userop',
    userOpHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    userOpSigningHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc'
  }
}

export const Basic: StoryFn<typeof UserOpRequestCard> = (args: React.ComponentProps<typeof UserOpRequestCard>) => (
  <UserOpRequestCard {...args} />
)
Basic.args = {
  request: sampleRequest,
  threshold: 2,
  onDelete: () => undefined,
  onReset: () => undefined
}
