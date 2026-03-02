import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import {} from '@chakra-ui/color-mode'

import Layout from './Layout'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof Layout> = {
  title: 'DOM/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'Dark' },
  }
}

export default meta

export const Basic: StoryFn<typeof Layout> = () => (
  <Web3Provider>
    <Layout>
      <VStack gap={4} align="stretch">
        <Heading size="lg">Content area</Heading>
        <Text>Place your pages inside the Layout to get consistent header and footer.</Text>
        <Box p={4} borderWidth="1px" borderRadius="md">Any Chakra UI content goes here.</Box>
      </VStack>
    </Layout>
  </Web3Provider>
)