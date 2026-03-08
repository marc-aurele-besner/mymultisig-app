import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import BasicCard from './BasicCard'

const meta: Meta<typeof BasicCard> = {
  title: 'Cards/BasicCard',
  component: BasicCard,
}

export default meta

export const Basic: StoryFn<typeof BasicCard> = (args: React.ComponentProps<typeof BasicCard>) => (
  <BasicCard {...args}>Hello World</BasicCard>
)
