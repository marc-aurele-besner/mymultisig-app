import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import Disclaimer from './Disclaimer'

export default {
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
} as ComponentMeta<typeof Disclaimer>

const Template: ComponentStory<typeof Disclaimer> = () => <Disclaimer />

export const Basic = Template.bind({})