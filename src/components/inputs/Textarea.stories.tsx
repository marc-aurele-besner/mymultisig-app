import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Textarea from './Textarea'

export default {
  title: 'Inputs/Textarea',
  component: Textarea,
  argTypes: {
    isDisabled: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' }
  }
} as ComponentMeta<typeof Textarea>

export const Basic: ComponentStory<typeof Textarea> = (args) => <Textarea {...args} />
Basic.args = {
  placeholder: 'Hello World'
}
