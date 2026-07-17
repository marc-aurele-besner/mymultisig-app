import React, { useState } from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import DurationInput from './DurationInput'

const meta: Meta<typeof DurationInput> = {
  title: 'Inputs/DurationInput',
  component: DurationInput,
}
export default meta

export const Basic: StoryFn<typeof DurationInput> = (args: React.ComponentProps<typeof DurationInput>) => {
  const [value, setValue] = useState('')
  return <DurationInput {...args} value={value} onChange={setValue} />
}
Basic.args = {
  helperText: 'How long a sensitive call should wait before it can execute',
  minSeconds: 7n * 24n * 60n * 60n
}
