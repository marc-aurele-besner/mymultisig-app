import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Switch from './Switch'

export default {
  title: 'Inputs/Switch',
  component: Switch,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof Switch>

export const Basic: ComponentStory<typeof Switch> = (args) => <Switch {...args} />
Switch.bind({
  placeholder: 'Hello World'
})
