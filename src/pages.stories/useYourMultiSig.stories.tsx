import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import Page from '../pages/useYourMultiSig'
import Web3Provider from '../components/web3/Web3Provider'

const meta: Meta<typeof Page> = {
  title: 'Pages/useYourMultiSig',
  component: Page,
}

export default meta

export const Basic: StoryFn<typeof Page> = (args: React.ComponentProps<typeof Page>) => (
  <Web3Provider>
    <Page {...args} />
  </Web3Provider>
)
