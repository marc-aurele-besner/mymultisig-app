import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { UserRejectedRequestError } from 'viem'

import WalletActionNotice from './WalletActionNotice'

const meta: Meta<typeof WalletActionNotice> = {
  title: 'Buttons/WalletActionNotice',
  component: WalletActionNotice
}

export default meta

const noop = () => {}

export const Rejected: StoryFn<typeof WalletActionNotice> = () => (
  <WalletActionNotice
    error={new UserRejectedRequestError(new Error('User rejected the request.'))}
    action='execution'
    onDismiss={noop}
  />
)

export const Failed: StoryFn<typeof WalletActionNotice> = () => (
  <WalletActionNotice
    error={new Error('Execution reverted: insufficient funds for gas * price + value\n\nRequest Arguments: ...')}
    action='execution'
    onDismiss={noop}
  />
)
