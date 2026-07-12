import React from 'react'

import '../src/styles/globals.css'

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: 'centered',
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Welcome', 'Theme', 'Components', 'Views', 'Pages'],
    },
  },
  backgrounds: {
    default: 'Dark',
    values: [
      { name: 'Dark', value: '#151310' },
      { name: 'Light', value: '#faf8f4' },
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
}

export const decorators = [
  (Story) => (
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <Story />
    </div>
  ),
]
