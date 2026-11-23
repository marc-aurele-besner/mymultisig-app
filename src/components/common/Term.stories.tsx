import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Term from './Term'

const meta: Meta<typeof Term> = {
  title: 'Common/Term',
  component: Term
}

export default meta

export const InSentence: StoryFn<typeof Term> = (args: React.ComponentProps<typeof Term>) => (
  <p className='max-w-md p-16 text-sm text-muted-foreground'>
    Approving is free. Only the owner who sends the final transaction pays a small <Term {...args} /> fee.
  </p>
)
InSentence.args = {
  id: 'gas'
}

export const CustomLabel: StoryFn<typeof Term> = (args: React.ComponentProps<typeof Term>) => (
  <p className='max-w-md p-16 text-sm text-muted-foreground'>
    Send a little of the network&apos;s <Term {...args} /> to the new wallet.
  </p>
)
CustomLabel.args = {
  id: 'nativeCoin',
  children: 'main coin'
}
