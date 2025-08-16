import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import FooterLink from './FooterLink'

export default {
  title: 'Footer/FooterLink',
  component: FooterLink,
} as ComponentMeta<typeof FooterLink>

export const Basic: ComponentStory<typeof FooterLink> = (args) => <FooterLink {...args} />
Basic.args = {
  name: 'MyMultiSig.app',
  link: '/',
  imagePath: '/icons/android-icon-512x512.png',
}
