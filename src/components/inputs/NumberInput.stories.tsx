import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import NumberInput from './NumberInput'

export default {
  title: 'Inputs/NumberInput',
  component: NumberInput,
  argTypes: {
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg'] },
    hasStepper: { control: 'boolean' },
    allowMouseWheel: { control: 'boolean' },
  },
} as ComponentMeta<typeof NumberInput>

export const Basic: ComponentStory<typeof NumberInput> = (args) => <NumberInput {...args} />
Basic.args = {
  placeholder: 'Amount',
  defaultValue: 1,
  min: 0,
  max: 10,
  step: 1,
  hasStepper: true,
}
