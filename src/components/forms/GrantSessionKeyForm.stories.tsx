import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import GrantSessionKeyForm from './GrantSessionKeyForm'

const meta: Meta<typeof GrantSessionKeyForm> = {
  title: 'Forms/GrantSessionKeyForm',
  component: GrantSessionKeyForm
}

export default meta

export const Basic: StoryFn<typeof GrantSessionKeyForm> = (args: React.ComponentProps<typeof GrantSessionKeyForm>) => (
  <GrantSessionKeyForm {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
  modules: ['0x3333333333333333333333333333333333333333'],
  allowlistOn: false
}
