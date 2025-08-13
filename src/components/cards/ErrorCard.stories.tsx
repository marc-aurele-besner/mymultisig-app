import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Text } from '@chakra-ui/react'

import ErrorCard from './ErrorCard'

export default {
  title: 'Cards/ErrorCard',
  component: ErrorCard,
} as ComponentMeta<typeof ErrorCard>

export const Basic: ComponentStory<typeof ErrorCard> = (args) => <ErrorCard {...args} />
Basic.args = {
  children: <Text>Hello World</Text>,
}
