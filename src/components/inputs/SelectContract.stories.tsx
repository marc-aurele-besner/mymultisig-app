import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import SelectContract from './SelectContract'

export default {
  title: 'Inputs/SelectContract',
  component: SelectContract,
} as ComponentMeta<typeof SelectContract>

export const Basic: ComponentStory<typeof SelectContract> = (args) => <SelectContract {...args} />
Basic.args = {
  onChange: action('contract-selected'),
}
