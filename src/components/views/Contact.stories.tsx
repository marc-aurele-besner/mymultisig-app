import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Contact from './Contact'

const meta: Meta<typeof Contact> = {
  title: 'Views/Contact',
  component: Contact,
}

export default meta

export const Basic: StoryFn<typeof Contact> = () => <Contact />
