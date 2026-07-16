import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import GuideLayout, { GuideSection, GuideText, GuideSteps, GuideNote } from './GuideLayout'

const meta: Meta<typeof GuideLayout> = {
  title: 'Docs/GuideLayout',
  component: GuideLayout,
}

export default meta

export const Basic: StoryFn<typeof GuideLayout> = () => (
  <GuideLayout
    kicker="GUIDE"
    title="Example guide"
    lead="A short lead paragraph that frames what this guide covers."
    related={[{ title: 'Another guide', href: '/docs' }]}
  >
    <GuideSection title="First section">
      <GuideText>
        Body copy with a <strong>bold term</strong> inline.
      </GuideText>
      <GuideSteps>
        <li>First step of the flow.</li>
        <li>Second step of the flow.</li>
      </GuideSteps>
      <GuideNote>
        <strong>Note:</strong> callout style for warnings and caveats.
      </GuideNote>
    </GuideSection>
  </GuideLayout>
)
