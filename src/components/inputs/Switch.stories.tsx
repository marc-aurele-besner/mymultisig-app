import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Switch from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Inputs/Switch',
  component: Switch,
  argTypes: {
    isDisabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
  }
}

export default meta

export const Basic: StoryFn<typeof Switch> = (args: React.ComponentProps<typeof Switch>) => <Switch {...args} />
Basic.args = {
  placeholder: 'Is Public',
}
