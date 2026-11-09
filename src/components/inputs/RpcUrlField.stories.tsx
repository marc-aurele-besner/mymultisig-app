import React, { useState } from 'react'
import type { StoryFn, Meta } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import RpcUrlField from './RpcUrlField'

const meta: Meta<typeof RpcUrlField> = {
  title: 'Inputs/RpcUrlField',
  component: RpcUrlField
}

export default meta

const queryClient = new QueryClient()

const Template: StoryFn<typeof RpcUrlField> = (args: React.ComponentProps<typeof RpcUrlField>) => {
  const [value, setValue] = useState(args.value)
  return (
    <QueryClientProvider client={queryClient}>
      <RpcUrlField {...args} value={value} onSave={(url) => setValue(url ?? undefined)} />
    </QueryClientProvider>
  )
}

export const Empty = Template.bind({})
Empty.args = { id: 'rpc-empty', label: 'Sepolia (chain 11155111)', chainId: 11155111 }

export const Saved = Template.bind({})
Saved.args = {
  id: 'rpc-saved',
  label: 'Sepolia (chain 11155111)',
  chainId: 11155111,
  value: 'https://ethereum-sepolia-rpc.publicnode.com'
}
