import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import GuidePath from './GuidePath'

const meta: Meta<typeof GuidePath> = {
  title: 'Docs/GuidePath',
  component: GuidePath
}

export default meta

export const Basic: StoryFn<typeof GuidePath> = (args: React.ComponentProps<typeof GuidePath>) => (
  <div className='w-[420px]'>
    <GuidePath {...args} />
  </div>
)
Basic.args = {
  steps: [
    { href: '/docs/what-is-a-multisig', label: 'What is a multisig?', hint: 'The idea, in plain words' },
    { href: '/docs/create-a-multisig', label: 'Create a multisig', hint: '6 steps, one transaction' },
    { href: '/docs/propose-sign-execute', label: 'Propose, sign, and execute', hint: 'The life of a request' }
  ]
}
