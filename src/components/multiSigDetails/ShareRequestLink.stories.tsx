import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ShareRequestLink from './ShareRequestLink'

const meta: Meta<typeof ShareRequestLink> = {
  title: 'MultiSigDetails/ShareRequestLink',
  component: ShareRequestLink
}

export default meta

export const Basic: StoryFn<typeof ShareRequestLink> = (args: React.ComponentProps<typeof ShareRequestLink>) => (
  <ShareRequestLink {...args} />
)
Basic.args = {
  requestId: '7f3c1b2e-9a4d-4e8b-9c2f-1a2b3c4d5e6f'
}
