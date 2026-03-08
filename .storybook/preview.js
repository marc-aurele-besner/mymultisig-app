import React from 'react'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
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
      order: ['Introduction', 'Theme', 'Components', 'Views', 'Pages'],
    },
  },
  backgrounds: {
    default: 'dark',
    values: [
      { name: 'Light', value: '#f7fafc' },
      { name: 'Dark', value: '#0b1020' },
      { name: 'Gray', value: '#1A202C' }
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
    <div style={{ minHeight: '100vh', padding: 24 }}>
      <Story />
    </div>
  ),
]
