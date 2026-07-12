import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import NumberInput from './NumberInput'

const meta: Meta<typeof NumberInput> = {
  title: 'Inputs/NumberInput',
  component: NumberInput,
  argTypes: {
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg'] },
    hasStepper: { control: 'boolean' },
    allowMouseWheel: { control: 'boolean' },
  },
}

export default meta

export const Basic: StoryFn<typeof NumberInput> = (args: React.ComponentProps<typeof NumberInput>) => <NumberInput {...args} />
Basic.args = {
  placeholder: 'Amount',
  defaultValue: 1,
  min: 0,
  max: 10,
  step: 1,
  hasStepper: true,
}
