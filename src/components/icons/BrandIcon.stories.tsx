import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import BrandIcon from './BrandIcon'

const meta: Meta<typeof BrandIcon> = {
  title: 'Icons/BrandIcon',
  component: BrandIcon
}

export default meta

export const Basic: StoryFn<typeof BrandIcon> = (args: React.ComponentProps<typeof BrandIcon>) => (
  <BrandIcon {...args} />
)
Basic.args = {
  brand: 'slack',
  size: 32
}

export const All: StoryFn<typeof BrandIcon> = () => (
  <div className='flex items-center gap-4'>
    <BrandIcon brand='slack' size={32} />
    <BrandIcon brand='discord' size={32} />
    <BrandIcon brand='telegram' size={32} />
    <BrandIcon brand='email' size={32} />
  </div>
)
