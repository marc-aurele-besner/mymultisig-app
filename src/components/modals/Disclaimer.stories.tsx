import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'

import Disclaimer from './Disclaimer'

const meta: Meta<typeof Disclaimer> = {
  title: 'Modals/Disclaimer',
  component: Disclaimer,
  parameters: {
    docs: {
      description: {
        component: 'Risk acknowledgement shown the first time someone connects a wallet.'
      }
    }
  }
}

export default meta

const Template: StoryFn<typeof Disclaimer> = (args: React.ComponentProps<typeof Disclaimer>) => (
  <Disclaimer {...args} />
)

export const Basic = Template.bind({})
Basic.args = {
  open: true,
  onOpenChange: () => {},
  onAccept: () => {}
}
