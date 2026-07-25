import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import DiscordSettings from './DiscordSettings'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof DiscordSettings> = {
  title: 'Views/DiscordSettings',
  component: DiscordSettings
}

export default meta

// The page calls /api/discord/workspaces on mount. The default story is
// rendered without that endpoint being available, so the page lands in
// the 'error' state. That's still a useful visual — the install CTA
// never gets reached, so the page is mostly empty + an error banner.
export const Basic: StoryFn<typeof DiscordSettings> = (args: React.ComponentProps<typeof DiscordSettings>) => (
  <Web3Provider>
    <DiscordSettings {...args} />
  </Web3Provider>
)
