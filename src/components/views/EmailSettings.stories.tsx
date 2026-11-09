import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import EmailSettings from './EmailSettings'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof EmailSettings> = {
  title: 'Views/EmailSettings',
  component: EmailSettings
}

export default meta

// The page calls /api/email/subscription on mount. Without a session in
// Storybook it lands in the signed-out state, which is the useful visual for
// the form-less case.
export const Basic: StoryFn<typeof EmailSettings> = (args: React.ComponentProps<typeof EmailSettings>) => (
  <Web3Provider>
    <EmailSettings {...args} />
  </Web3Provider>
)
