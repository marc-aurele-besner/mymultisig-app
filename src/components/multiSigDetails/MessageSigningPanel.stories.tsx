import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import MessageSigningPanel from './MessageSigningPanel'

const meta: Meta<typeof MessageSigningPanel> = {
  title: 'MultiSigDetails/MessageSigningPanel',
  component: MessageSigningPanel
}

export default meta

const Template: StoryFn<typeof MessageSigningPanel> = (args: React.ComponentProps<typeof MessageSigningPanel>) => (
  <MessageSigningPanel {...args} />
)

export const Basic = Template.bind({})
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  walletName: 'Treasury',
  walletVersion: '0.5.2',
  threshold: 2,
  owners: ['0x1111111111111111111111111111111111111111', '0x3333333333333333333333333333333333333333']
}

// 0.5.0 wallets check owner signatures against the raw digest: the panel
// warns and offers only the on-chain registry.
export const UnboundVotes050 = Template.bind({})
UnboundVotes050.args = {
  ...Basic.args,
  walletVersion: '0.5.0',
  threshold: 1
}
