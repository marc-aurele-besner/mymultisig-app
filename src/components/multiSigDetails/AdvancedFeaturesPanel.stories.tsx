import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AdvancedFeaturesPanel from './AdvancedFeaturesPanel'

const meta: Meta<typeof AdvancedFeaturesPanel> = {
  title: 'MultiSigDetails/AdvancedFeaturesPanel',
  component: AdvancedFeaturesPanel,
}

export default meta

export const Basic: StoryFn<typeof AdvancedFeaturesPanel> = (
  args: React.ComponentProps<typeof AdvancedFeaturesPanel>
) => <AdvancedFeaturesPanel {...args} />
Basic.args = {
  multiSigAddress: '0x2222222222222222222222222222222222222222',
}
