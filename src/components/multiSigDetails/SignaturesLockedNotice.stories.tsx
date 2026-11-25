import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SignaturesLockedNotice from './SignaturesLockedNotice'

const meta: Meta<typeof SignaturesLockedNotice> = {
  title: 'MultiSigDetails/SignaturesLockedNotice',
  component: SignaturesLockedNotice
}

export default meta

const Template: StoryFn<typeof SignaturesLockedNotice> = (
  args: React.ComponentProps<typeof SignaturesLockedNotice>
) => <SignaturesLockedNotice {...args} />

export const Owner = Template.bind({})
Owner.args = { isOwner: true }

export const NotAnOwner = Template.bind({})
NotAnOwner.args = { isOwner: false }
