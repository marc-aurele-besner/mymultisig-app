import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import TextInput from './TextInput'

const meta: Meta<typeof TextInput> = {
  title: 'Inputs/TextInput',
  component: TextInput,
  argTypes: {
    isDisabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
  },
}

export default meta

export const Basic: StoryFn<typeof TextInput> = (args: React.ComponentProps<typeof TextInput>) => <TextInput {...args} />
Basic.args = {
  placeholder: 'Hello World',
}
