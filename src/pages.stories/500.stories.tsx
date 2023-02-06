import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Page from '../pages/500'
import Web3Provider from '../components/web3/Web3Provider'

export default {
  title: 'Pages/500',
  component: Page,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Page>

export const Basic: ComponentStory<typeof Page> = (args) => (
  <Web3Provider>
    <Page {...args} />
  </Web3Provider>
)
