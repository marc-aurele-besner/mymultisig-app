import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Networks from './Networks'

const meta: Meta<typeof Networks> = {
  title: 'Views/Networks',
  component: Networks,
}

export default meta

export const Basic: StoryFn<typeof Networks> = () => <Networks />
