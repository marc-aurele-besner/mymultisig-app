import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import InboxSection from './InboxSection'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof InboxSection> = {
  title: 'Inbox/InboxSection',
  component: InboxSection
}

export default meta

export const Basic: StoryFn<typeof InboxSection> = (args: React.ComponentProps<typeof InboxSection>) => (
  <Web3Provider>
    <div className='w-[640px]'>
      <InboxSection {...args} />
    </div>
  </Web3Provider>
)
Basic.args = {
  title: 'Needs your signature',
  emptyText: 'Nothing to sign right now.',
  items: [
    {
      status: 'sign',
      wallet: {
        chainId: 11155111,
        chainName: 'Sepolia',
        factoryAddress: '0x5c529198e6b4d2DCBb2f3201062A7e9194298d5a',
        id: 1,
        name: 'Team Treasury',
        version: '0.5.0',
        address: '0x2222222222222222222222222222222222222222',
        threshold: 2,
        ownerCount: 3,
        nonce: 12,
        owners: ['0x1111111111111111111111111111111111111111']
      },
      request: {
        id: '11111111-1111-4111-8111-111111111111',
        multiSigAddress: '0x2222222222222222222222222222222222222222',
        request: { to: '0x3333333333333333333333333333333333333333', value: '0', data: '0x', txnGas: '35000', signatures: '0x' },
        description: 'Pay the Q4 audit deposit',
        submitter: '0x1111111111111111111111111111111111111111',
        signatures: ['0x00'],
        ownerSigners: ['0x1111111111111111111111111111111111111111'],
        dateSubmitted: '2026-11-08T12:00:00.000Z',
        dateExecuted: '',
        isActive: true,
        isExecuted: false,
        isCancelled: false,
        isConfirmed: false,
        isSuccessful: false,
        dateCancelled: '',
        cancelledBy: ''
      }
    }
  ]
}
