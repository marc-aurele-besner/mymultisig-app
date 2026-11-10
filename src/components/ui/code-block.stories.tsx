import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import { CodeBlock } from './code-block'

const meta: Meta<typeof CodeBlock> = {
  title: 'UI/CodeBlock',
  component: CodeBlock
}

export default meta

export const Basic: StoryFn<typeof CodeBlock> = (args: React.ComponentProps<typeof CodeBlock>) => (
  <div className='w-[560px]'>
    <CodeBlock {...args} />
  </div>
)
Basic.args = {
  title: 'terminal',
  code: 'claude mcp add mymultisig -e MYMULTISIG_API_KEY=mms_… -- npx -y mymultisig-mcp'
}
