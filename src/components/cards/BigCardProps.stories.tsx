import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import BigCard from './BigCard'

const meta: Meta<typeof BigCard> = {
  title: 'Cards/BigCard',
  component: BigCard,
}

export default meta

export const Basic: StoryFn<typeof BigCard> = (args: React.ComponentProps<typeof BigCard>) => (
  <BigCard {...args}>Hello World</BigCard>
)
