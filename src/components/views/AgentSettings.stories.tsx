import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AgentSettings, { AgentKeyList, CopyButton } from './AgentSettings'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof AgentSettings> = {
  title: 'Views/AgentSettings',
  component: AgentSettings
}

export default meta

// The page calls /api/agent-keys on mount. Without a session in Storybook it
// lands in the signed-out state.
export const Basic: StoryFn<typeof AgentSettings> = (args: React.ComponentProps<typeof AgentSettings>) => (
  <Web3Provider>
    <AgentSettings {...args} />
  </Web3Provider>
)

const now = Date.now()

export const KeyList: StoryFn<typeof AgentKeyList> = () => (
  <div className='max-w-3xl p-6'>
    <AgentKeyList
      revokingId={null}
      onRevoke={() => undefined}
      keys={[
        {
          id: '00000000-0000-4000-8000-000000000001',
          name: 'Claude Code on my laptop',
          keyPrefix: 'mms_Ab3dE6gH',
          scopes: ['read', 'propose', 'sign'],
          walletAddresses: [],
          createdAt: new Date(now - 7 * 86_400_000).toISOString(),
          lastUsedAt: new Date(now - 3_600_000).toISOString(),
          expiresAt: new Date(now + 83 * 86_400_000).toISOString(),
          revokedAt: null
        },
        {
          id: '00000000-0000-4000-8000-000000000002',
          name: 'Treasury bot (read only)',
          keyPrefix: 'mms_Zx9Yw8Vu',
          scopes: ['read'],
          walletAddresses: ['0x1111111111111111111111111111111111111111'],
          createdAt: new Date(now - 40 * 86_400_000).toISOString(),
          lastUsedAt: null,
          expiresAt: null,
          revokedAt: new Date(now - 86_400_000).toISOString()
        }
      ]}
    />
  </div>
)

export const EmptyKeyList: StoryFn<typeof AgentKeyList> = () => (
  <div className='max-w-3xl p-6'>
    <AgentKeyList keys={[]} revokingId={null} onRevoke={() => undefined} />
  </div>
)

export const Copy: StoryFn<typeof CopyButton> = () => (
  <div className='p-6'>
    <CopyButton value='mms_example' />
  </div>
)
