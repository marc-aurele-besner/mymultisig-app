import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import NoWalletPanel from './NoWalletPanel'

const meta: Meta<typeof NoWalletPanel> = {
  title: 'Views/NoWalletPanel',
  component: NoWalletPanel,
  args: {
    pageUrl: 'https://mymultisig.app/',
    onCreateSmartWallet: () => undefined
  }
}

export default meta

const Template: StoryFn<typeof NoWalletPanel> = (args) => (
  <div className='max-w-[460px]'>
    <NoWalletPanel {...args} />
  </div>
)

export const Desktop = Template.bind({})

export const Mobile = Template.bind({})
Mobile.args = { mobile: true }

export const AfterStalledConnect = Template.bind({})
AfterStalledConnect.args = {
  mobile: true,
  reason: 'MetaMask did not answer. If no prompt opened, you may not have the app yet.'
}
