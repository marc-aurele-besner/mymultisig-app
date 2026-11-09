import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import PageHero from './PageHero'

const meta: Meta<typeof PageHero> = {
  title: 'Layout/PageHero',
  component: PageHero
}

export default meta

export const Basic: StoryFn<typeof PageHero> = (args: React.ComponentProps<typeof PageHero>) => (
  <div className='w-[900px]'>
    <PageHero {...args} />
  </div>
)
Basic.args = {
  eyebrow: 'SUPPORTED NETWORKS',
  title: 'One multisig, 7 EVM mainnets',
  lead: 'The same open-source contract on every supported network.',
  visual: <div className='h-48 rounded-xl border border-border bg-card' />
}
