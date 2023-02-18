import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import SelectContract from './SelectContract'

export default {
  title: 'Inputs/SelectContract',
  component: SelectContract,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof SelectContract>

export const Basic: ComponentStory<typeof SelectContract> = (args) => <SelectContract {...args} />
SelectContract.bind({
  placeholder: 'Hello World',
})
