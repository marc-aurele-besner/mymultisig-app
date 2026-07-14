import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import FooterLink from './FooterLink'

const meta: Meta<typeof FooterLink> = {
  title: 'Footer/FooterLink',
  component: FooterLink
}

export default meta

export const Basic: StoryFn<typeof FooterLink> = (args: React.ComponentProps<typeof FooterLink>) => (
  <FooterLink {...args} />
)
Basic.args = {
  name: 'MyMultiSig.app',
  link: '/',
  imagePath: '/favicon/web-app-manifest-512x512.png'
}
