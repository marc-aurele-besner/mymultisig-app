import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Switch from './Switch'

export default {
  title: 'Inputs/Switch',
  component: Switch,
  argTypes: {
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
  }
} as ComponentMeta<typeof Switch>

export const Basic: ComponentStory<typeof Switch> = (args) => <Switch {...args} />
Basic.args = {
  placeholder: 'Is Public',
}
