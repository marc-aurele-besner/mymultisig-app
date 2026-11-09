import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ExecutionOutcome from './ExecutionOutcome'

const meta: Meta<typeof ExecutionOutcome> = {
  title: 'MultiSigDetails/ExecutionOutcome',
  component: ExecutionOutcome
}

export default meta

const Template: StoryFn<typeof ExecutionOutcome> = (args: React.ComponentProps<typeof ExecutionOutcome>) => (
  <ExecutionOutcome {...args} />
)

const base = {
  dateExecuted: '2026-11-09T15:42:10.000Z',
  valueLabel: '0.001 ETH',
  targetLabel: 'Tester03 (0x5dFb…7Eed)',
  multiSigAddress: '0x17aC00000000000000000000000000000008485' as `0x${string}`,
  executionTxHash: '0x9f2c4b1e7a3d5c6b8e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d' as `0x${string}`,
  explorerUrl: 'https://sepolia.etherscan.io'
}

export const Success = Template.bind({})
Success.args = { ...base, outcome: 'success' }

export const Failed = Template.bind({})
Failed.args = { ...base, outcome: 'failed' }

export const PartialBatch = Template.bind({})
PartialBatch.args = { ...base, outcome: 'partial', valueLabel: undefined, failedSteps: 1, totalSteps: 3 }

export const LegacyWithoutTxHash = Template.bind({})
LegacyWithoutTxHash.args = { ...base, outcome: 'success', executionTxHash: undefined }
