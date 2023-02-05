import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Text } from '@chakra-ui/react'

import BasicCard from './BasicCard'

export default {
  title: 'Cards/BasicCard',
  component: BasicCard,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof BasicCard>

export const Basic: ComponentStory<typeof BasicCard> = (args) => <BasicCard {...args} />
BasicCard.bind({
  children: <Text>Hello World</Text>,
})
