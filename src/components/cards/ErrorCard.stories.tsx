import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import ErrorCard from './ErrorCard'

const meta: Meta<typeof ErrorCard> = {
  title: 'Cards/ErrorCard',
  component: ErrorCard,
}

export default meta

export const Basic: StoryFn<typeof ErrorCard> = (args: React.ComponentProps<typeof ErrorCard>) => (
  <ErrorCard {...args}>Hello World</ErrorCard>
)
