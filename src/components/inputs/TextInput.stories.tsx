import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import TextInput from './TextInput'

export default {
  title: 'Inputs/TextInput',
  component: TextInput,
  argTypes: {
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
  },
} as ComponentMeta<typeof TextInput>

export const Basic: ComponentStory<typeof TextInput> = (args) => <TextInput {...args} />
Basic.args = {
  placeholder: 'Hello World',
}
