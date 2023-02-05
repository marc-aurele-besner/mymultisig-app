import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Text } from '@chakra-ui/react'

import BigCard from './BigCard'

export default {
  title: 'Cards/BigCard',
  component: BigCard,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof BigCard>

export const Basic: ComponentStory<typeof BigCard> = (args) => <BigCard {...args} />
BigCard.bind({
  children: <Text>Hello World</Text>,
})
