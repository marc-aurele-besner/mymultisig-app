import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
// import { action } from '@storybook/addon-actions' // Removed in Storybook v10

import SelectContract from './SelectContract'

const meta: Meta<typeof SelectContract> = {
  title: 'Inputs/SelectContract',
  component: SelectContract,
}

export default meta

export const Basic: StoryFn<typeof SelectContract> = (args: React.ComponentProps<typeof SelectContract>) => <SelectContract {...args} />
Basic.args = {
  onChange: () => {},
}
