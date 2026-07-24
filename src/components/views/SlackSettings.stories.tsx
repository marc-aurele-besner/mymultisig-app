import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SlackSettings from './SlackSettings'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof SlackSettings> = {
  title: 'Views/SlackSettings',
  component: SlackSettings
}

export default meta

// The page calls /api/slack/workspaces on mount. The default story is
// rendered without that endpoint being available, so the page lands in
// the 'error' state. That's still a useful visual — the install CTA
// never gets reached, so the page is mostly empty + an error banner.
export const Basic: StoryFn<typeof SlackSettings> = (args: React.ComponentProps<typeof SlackSettings>) => (
  <Web3Provider>
    <SlackSettings {...args} />
  </Web3Provider>
)
