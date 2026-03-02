import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import { Text } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import {} from '@chakra-ui/color-mode'

import BasicCard from './BasicCard'

const meta: Meta<typeof BasicCard> = {
  title: 'Cards/BasicCard',
  component: BasicCard,
}

export default meta

export const Basic: StoryFn<typeof BasicCard> = (args: React.ComponentProps<typeof BasicCard>) => <BasicCard {...args} />
Basic.args = {
  children: <Text>Hello World</Text>,
}
