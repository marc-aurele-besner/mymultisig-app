import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import HeaderLink from './HeaderLink'

export default {
  title: 'Header/HeaderLink',
  component: HeaderLink,
} as ComponentMeta<typeof HeaderLink>

export const Basic: ComponentStory<typeof HeaderLink> = (args) => <HeaderLink {...args} />
Basic.args = {
  name: 'MyMultiSig.app',
  link: '/',
  imagePath: '/icons/android-icon-512x512.png',
}
