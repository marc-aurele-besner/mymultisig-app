import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Agents from './Agents'

const meta: Meta<typeof Agents> = {
  title: 'Views/Agents',
  component: Agents
}

export default meta

export const Basic: StoryFn<typeof Agents> = (args: React.ComponentProps<typeof Agents>) => (
  <Agents {...args} />
)
