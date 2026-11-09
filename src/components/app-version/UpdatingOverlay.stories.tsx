import type { Meta, StoryObj } from '@storybook/react'
import UpdatingOverlay from './UpdatingOverlay'

const meta: Meta<typeof UpdatingOverlay> = {
  title: 'AppVersion/UpdatingOverlay',
  component: UpdatingOverlay,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'Dark' }
  },
  args: {
    message: null,
    stuck: false,
    onReload: () => {}
  }
}

export default meta
type Story = StoryObj<typeof UpdatingOverlay>

export const Updating: Story = {}

export const WithSecurityReason: Story = {
  args: { message: 'security' }
}

export const Stuck: Story = {
  args: { stuck: true }
}
