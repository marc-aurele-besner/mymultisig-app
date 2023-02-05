import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import HeaderBox from './HeaderBox'

export default {
  title: 'Header/HeaderBox',
  component: HeaderBox,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof HeaderBox>

export const Basic: ComponentStory<typeof HeaderBox> = (args) => <HeaderBox {...args} />
