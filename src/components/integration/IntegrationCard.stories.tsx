import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import IntegrationCard from './IntegrationCard'

const meta: Meta<typeof IntegrationCard> = {
  title: 'Integration/IntegrationCard',
  component: IntegrationCard
}

export default meta

export const Basic: StoryFn<typeof IntegrationCard> = (args: React.ComponentProps<typeof IntegrationCard>) => (
  <div className='w-[420px]'>
    <IntegrationCard {...args} />
  </div>
)
Basic.args = {
  integration: {
    keyword: 'slack',
    title: 'Slack',
    status: 'available',
    description: 'Bring requests to the channel where your team already talks.',
    features: ['Post each new request to a channel of your choice', 'One-click link to the request page to sign'],
    note: 'Add the app to your workspace, then run /bind in the channel that should get notifications.',
    cta: { label: 'Add to Slack', href: '/settings/slack' }
  }
}
