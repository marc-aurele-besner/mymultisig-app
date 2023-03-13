import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import AddContactForm from './AddContactForm'

export default {
  title: 'Forms/AddContactForm',
  component: AddContactForm,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof AddContactForm>

export const Basic: ComponentStory<typeof AddContactForm> = (args) => <AddContactForm {...args} />
AddContactForm.bind({
  owner01: '0x0000000000000000000000000000000000000000'
})
