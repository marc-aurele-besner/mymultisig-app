import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'

import Disclaimer from './Disclaimer'

const meta: Meta<typeof Disclaimer> = {
  title: 'Modals/Disclaimer',
  component: Disclaimer,
  parameters: {
    docs: {
      description: {
        component:
          'Auto-opens on mount to show the application disclaimer. Uses Chakra UI modal primitives. '
      }
    }
  }
}

export default meta

const Template: StoryFn<typeof Disclaimer> = () => <Disclaimer />

export const Basic = Template.bind({})