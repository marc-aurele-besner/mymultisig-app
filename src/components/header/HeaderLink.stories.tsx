import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import HeaderLink from './HeaderLink'

export default {
  title: 'Header/HeaderLink',
  component: HeaderLink,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof HeaderLink>

export const Basic: ComponentStory<typeof HeaderLink> = () => (
  <HeaderLink name='MyMultiSig.app' link='/' imagePath='/icons/android-icon-512x512.png' />
)
