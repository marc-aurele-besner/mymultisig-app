import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import { Text } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'

import BigCard from './BigCard'

const meta: Meta<typeof BigCard> = {
  title: 'Cards/BigCard',
  component: BigCard,
}

export default meta

export const Basic: StoryFn<typeof BigCard> = (args: React.ComponentProps<typeof BigCard>) => <BigCard {...args} />
Basic.args = {
  children: <Text>Hello World</Text>,
}
