import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import NotificationFeed from './NotificationFeed'

const meta: Meta<typeof NotificationFeed> = {
  title: 'Integration/NotificationFeed',
  component: NotificationFeed
}

export default meta

export const Basic: StoryFn<typeof NotificationFeed> = () => (
  <div className='w-[440px]'>
    <NotificationFeed />
  </div>
)
