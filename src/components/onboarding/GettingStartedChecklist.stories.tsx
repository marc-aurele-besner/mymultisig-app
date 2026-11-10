import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import GettingStartedChecklist from './GettingStartedChecklist'

const meta: Meta<typeof GettingStartedChecklist> = {
  title: 'Onboarding/GettingStartedChecklist',
  component: GettingStartedChecklist
}

export default meta

export const Basic: StoryFn<typeof GettingStartedChecklist> = (args: React.ComponentProps<typeof GettingStartedChecklist>) => (
  <div className='w-[420px]'>
    <GettingStartedChecklist {...args} />
  </div>
)
Basic.args = {
  steps: [
    { key: 'connect', title: 'Connect a wallet', description: 'Your wallet is your identity.', done: true },
    { key: 'signin', title: 'Sign in (free, no transaction)', description: 'One signature proves you own the wallet.', done: true },
    {
      key: 'wallet',
      title: 'Create or import a multisig',
      description: 'Pick the owners and how many must approve.',
      done: false,
      href: '/create-multisig',
      cta: 'Create'
    },
    { key: 'fund', title: 'Fund it', description: 'Send a little of the native coin.', done: false }
  ]
}
