import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import FooterBox from './FooterBox'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof FooterBox> = {
  title: 'Footer/FooterBox',
  component: FooterBox,
}

export default meta

export const Basic: StoryFn<typeof FooterBox> = (args: React.ComponentProps<typeof FooterBox>) => (
  <Web3Provider>
    <FooterBox {...args} />
  </Web3Provider>
)
