import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import FooterLink from './FooterLink'

export default {
  title: 'Footer/FooterLink',
  component: FooterLink,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof FooterLink>

export const Basic: ComponentStory<typeof FooterLink> = () => (
  <FooterLink name='MyMultiSig.app' link='/' imagePath='/icons/android-icon-512x512.png' />
)
