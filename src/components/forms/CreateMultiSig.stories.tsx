import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import CreateMultiSig from './CreateMultiSigForm'

export default {
  title: 'Forms/CreateMultiSig',
  component: CreateMultiSig,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof CreateMultiSig>

export const Basic: ComponentStory<typeof CreateMultiSig> = (args) => <CreateMultiSig {...args} />
CreateMultiSig.bind({
  owner01: '0x0000000000000000000000000000000000000000',
})
