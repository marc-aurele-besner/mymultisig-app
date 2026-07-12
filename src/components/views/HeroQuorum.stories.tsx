import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import HeroQuorum from './HeroQuorum'

const meta: Meta<typeof HeroQuorum> = {
  title: 'Views/HeroQuorum',
  component: HeroQuorum,
}

export default meta

export const Basic: StoryFn<typeof HeroQuorum> = () => (
  <div className="max-w-md">
    <HeroQuorum />
  </div>
)
