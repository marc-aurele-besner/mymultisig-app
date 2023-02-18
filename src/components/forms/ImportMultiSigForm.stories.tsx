import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ImportMultiSigForm from './ImportMultiSigForm'

export default {
  title: 'Forms/ImportMultiSig',
  component: ImportMultiSigForm,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof ImportMultiSigForm>

export const Basic: ComponentStory<typeof ImportMultiSigForm> = (args) => <ImportMultiSigForm {...args} />
ImportMultiSigForm.bind({
  owner01: '0x0000000000000000000000000000000000000000'
})
