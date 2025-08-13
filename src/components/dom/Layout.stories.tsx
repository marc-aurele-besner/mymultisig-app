import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'

import Layout from './Layout'

export default {
  title: 'DOM/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen'
  }
} as ComponentMeta<typeof Layout>

export const Basic: ComponentStory<typeof Layout> = () => (
  <Layout>
    <VStack spacing={4} align="stretch">
      <Heading size="lg">Content area</Heading>
      <Text>Place your pages inside the Layout to get consistent header and footer.</Text>
      <Box p={4} borderWidth="1px" borderRadius="md">Any Chakra UI content goes here.</Box>
    </VStack>
  </Layout>
)