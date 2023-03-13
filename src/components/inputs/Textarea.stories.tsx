import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Textarea from './Textarea'

export default {
  title: 'Inputs/Textarea',
  component: Textarea,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof Textarea>

export const Basic: ComponentStory<typeof Textarea> = (args) => <Textarea {...args} />
Textarea.bind({
  placeholder: 'Hello World'
})
