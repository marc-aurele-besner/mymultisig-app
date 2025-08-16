import theme from '../src/styles/theme'
import React from 'react'
import { Box } from '@chakra-ui/react'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  chakra: {
    theme,
  },
  layout: 'centered',
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Introduction', 'Theme', 'Components', 'Views', 'Pages'],
    },
  },
  backgrounds: {
    default: 'Light',
    values: [
      { name: 'Light', value: '#f7fafc' },
      { name: 'Dark', value: '#0b1020' },
      { name: 'Chakra Gray', value: '#1A202C' }
    ],
  },
  viewport: {
    viewports: {
      mobileSmall: {
        name: 'Mobile S',
        styles: { width: '320px', height: '568px' },
        type: 'mobile',
      },
      mobileLarge: {
        name: 'Mobile L',
        styles: { width: '414px', height: '896px' },
        type: 'mobile',
      },
      tablet: {
        name: 'Tablet',
        styles: { width: '768px', height: '1024px' },
        type: 'tablet',
      },
      desktop: {
        name: 'Desktop',
        styles: { width: '1280px', height: '800px' },
        type: 'desktop',
      },
    },
  },
  docs: {
    inlineStories: true,
  }
}

export const decorators = [
  (Story) => (
    <Box minH="100vh" p={6}>
      <Story />
    </Box>
  ),
]
