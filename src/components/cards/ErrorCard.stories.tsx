import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import { Text } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'

import ErrorCard from './ErrorCard'

const meta: Meta<typeof ErrorCard> = {
  title: 'Cards/ErrorCard',
  component: ErrorCard,
}

export default meta

export const Basic: StoryFn<typeof ErrorCard> = (args: React.ComponentProps<typeof ErrorCard>) => <ErrorCard {...args} />
Basic.args = {
  children: <Text>Hello World</Text>,
}
