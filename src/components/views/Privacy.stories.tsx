import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Privacy from './Privacy'

const meta: Meta<typeof Privacy> = {
  title: 'Views/Privacy',
  component: Privacy,
}

export default meta

export const Basic: StoryFn<typeof Privacy> = () => <Privacy />
