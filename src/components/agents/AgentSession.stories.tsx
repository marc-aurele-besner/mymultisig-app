import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AgentSession from './AgentSession'

const meta: Meta<typeof AgentSession> = {
  title: 'Agents/AgentSession',
  component: AgentSession
}

export default meta

export const Basic: StoryFn<typeof AgentSession> = () => (
  <div className='w-[440px]'>
    <AgentSession />
  </div>
)
