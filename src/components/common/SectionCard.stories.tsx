import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import SectionCard from './SectionCard'

const meta: Meta<typeof SectionCard> = {
  title: 'Common/SectionCard',
  component: SectionCard
}

export default meta

export const Basic: StoryFn<typeof SectionCard> = (args: React.ComponentProps<typeof SectionCard>) => (
  <div className='w-[420px]'>
    <SectionCard {...args}>
      <p className='text-sm text-muted-foreground'>Card content</p>
    </SectionCard>
  </div>
)
Basic.args = {
  title: 'Owners'
}
