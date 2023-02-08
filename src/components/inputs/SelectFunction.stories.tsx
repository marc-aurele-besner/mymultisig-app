import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import SelectFunction from './SelectFunction'

export default {
  title: 'Inputs/SelectFunction',
  component: SelectFunction,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof SelectFunction>

export const Basic: ComponentStory<typeof SelectFunction> = (args) => <SelectFunction {...args} />
SelectFunction.bind({
  placeholder: 'Hello World',
})
