import type { Meta, StoryObj } from '@storybook/react'
import UpdateBanner from './UpdateBanner'

const meta: Meta<typeof UpdateBanner> = {
  title: 'AppVersion/UpdateBanner',
  component: UpdateBanner,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'Dark' }
  },
  args: {
    onRefresh: () => {},
    onLater: () => {}
  }
}

export default meta
type Story = StoryObj<typeof UpdateBanner>

export const Default: Story = {}
