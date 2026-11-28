import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SessionKeysPanel from './SessionKeysPanel'

const meta: Meta<typeof SessionKeysPanel> = {
  title: 'MultiSigDetails/SessionKeysPanel',
  component: SessionKeysPanel
}

export default meta

export const Basic: StoryFn<typeof SessionKeysPanel> = (args: React.ComponentProps<typeof SessionKeysPanel>) => (
  <SessionKeysPanel {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  owners: ['0x1111111111111111111111111111111111111111']
}
