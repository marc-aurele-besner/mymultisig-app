import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Welcome from './Welcome'

export default {
  title: 'Views/Welcome',
  component: Welcome,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Welcome>

export const Basic: ComponentStory<typeof Welcome> = (args) => <Welcome {...args} />
