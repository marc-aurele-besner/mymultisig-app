import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SettingsLayout from './SettingsLayout'

const meta: Meta<typeof SettingsLayout> = {
  title: 'Settings/SettingsLayout',
  component: SettingsLayout
}

export default meta

export const Basic: StoryFn<typeof SettingsLayout> = (args: React.ComponentProps<typeof SettingsLayout>) => (
  <SettingsLayout {...args}>
    <div className='rounded-xl border border-border p-6 text-sm text-muted-foreground'>Settings page content</div>
  </SettingsLayout>
)
