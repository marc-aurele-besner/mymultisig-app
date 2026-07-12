import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Textarea from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Inputs/Textarea',
  component: Textarea,
  argTypes: {
    isDisabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    isInvalid: { control: 'boolean' }
  }
}

export default meta

export const Basic: StoryFn<typeof Textarea> = (args: React.ComponentProps<typeof Textarea>) => <Textarea {...args} />
Basic.args = {
  placeholder: 'Hello World'
}
