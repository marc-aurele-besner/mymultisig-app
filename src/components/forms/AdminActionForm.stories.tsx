import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AdminActionForm from './AdminActionForm'

const meta: Meta<typeof AdminActionForm> = {
  title: 'Forms/AdminActionForm',
  component: AdminActionForm,
}

export default meta

export const Basic: StoryFn<typeof AdminActionForm> = (args: React.ComponentProps<typeof AdminActionForm>) => (
  <AdminActionForm {...args} />
)
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
}
