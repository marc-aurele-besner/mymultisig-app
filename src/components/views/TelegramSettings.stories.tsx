import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import TelegramSettings from './TelegramSettings'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof TelegramSettings> = {
  title: 'Views/TelegramSettings',
  component: TelegramSettings
}

export default meta

// The page calls /api/telegram/installations on mount. The default story
// is rendered without that endpoint being available, so the page lands in
// the 'error' state. That's still a useful visual — the install form
// never gets reached, so the page is mostly empty + an error banner.
// Same caveat as the Slack/Discord stories.
export const Basic: StoryFn<typeof TelegramSettings> = (args: React.ComponentProps<typeof TelegramSettings>) => (
  <Web3Provider>
    <TelegramSettings {...args} />
  </Web3Provider>
)
