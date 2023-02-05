import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import NumberInput from './NumberInput'

export default {
  title: 'Inputs/NumberInput',
  component: NumberInput,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof NumberInput>

export const Basic: ComponentStory<typeof NumberInput> = (args) => <NumberInput {...args} />
NumberInput.bind({
  placeholder: 'Hello World',
})
