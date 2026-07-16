import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ScheduledExecutionPanel from './ScheduledExecutionPanel'

const meta: Meta<typeof ScheduledExecutionPanel> = {
  title: 'MultiSigDetails/ScheduledExecutionPanel',
  component: ScheduledExecutionPanel,
}

export default meta

export const Basic: StoryFn<typeof ScheduledExecutionPanel> = (
  args: React.ComponentProps<typeof ScheduledExecutionPanel>
) => <ScheduledExecutionPanel {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
  thresholdReached: true,
  request: {
    id: 'story-request',
    multiSigAddress: '0x2222222222222222222222222222222222222222',
    request: {
      to: '0x2222222222222222222222222222222222222222',
      value: '0',
      data: '0x7065cb480000000000000000000000003333333333333333333333333333333333333333',
      txnGas: '75000',
      signatures: '0x',
    },
    description: 'Add owner (timelocked)',
    submitter: '0x3333333333333333333333333333333333333333',
    signatures: [],
    ownerSigners: [],
    dateSubmitted: '1750000000000',
    dateExecuted: '',
    isActive: true,
    isExecuted: false,
    isCancelled: false,
    isConfirmed: false,
    isSuccessful: false,
  },
}
