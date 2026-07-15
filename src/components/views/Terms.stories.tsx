import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Terms from './Terms'

const meta: Meta<typeof Terms> = {
  title: 'Views/Terms',
  component: Terms,
}

export default meta

export const Basic: StoryFn<typeof Terms> = () => <Terms />
