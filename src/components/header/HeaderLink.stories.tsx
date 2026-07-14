import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import HeaderLink from './HeaderLink'

const meta: Meta<typeof HeaderLink> = {
  title: 'Header/HeaderLink',
  component: HeaderLink
}

export default meta

export const Basic: StoryFn<typeof HeaderLink> = (args: React.ComponentProps<typeof HeaderLink>) => (
  <HeaderLink {...args} />
)
Basic.args = {
  name: 'MyMultiSig.app',
  link: '/',
  imagePath: '/favicon/web-app-manifest-512x512.png'
}
