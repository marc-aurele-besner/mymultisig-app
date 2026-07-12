import React from 'react'
import type { Meta, StoryFn } from '@storybook/react'
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
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Content area</h2>
        <p>Place your pages inside the Layout to get consistent header and footer.</p>
        <div className="rounded-md border border-border p-4">Any content goes here.</div>
      </div>
    </Layout>
  </Web3Provider>
)