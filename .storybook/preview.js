import React from 'react'

import '../src/styles/globals.css'
import Web3Provider from '../src/components/web3/Web3Provider'

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

// Most components read wallet state through wagmi hooks, directly or through a
// child (address inputs, network icons, the shell). Providing wagmi and React
// Query here means no story fails with "`useConfig` must be used within
// `WagmiProvider`" because it forgot its own wrapper. Stories that still wrap
// themselves in Web3Provider keep working: the inner provider simply wins.
export const decorators = [
  (Story) => (
    <Web3Provider>
      <div style={{ minHeight: '100vh', padding: 24 }}>
        <Story />
      </div>
    </Web3Provider>
  ),
]
