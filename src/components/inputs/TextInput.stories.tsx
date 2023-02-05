import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import TextInput from './TextInput'

export default {
  title: 'Inputs/TextInput',
  component: TextInput,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof TextInput>

export const Basic: ComponentStory<typeof TextInput> = (args) => <TextInput {...args} />
TextInput.bind({
  placeholder: 'Hello World',
})
