import React, { useEffect } from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ConnectModal from './ConnectModal'
import Web3Provider from '../web3/Web3Provider'
import useConnectModal from '../../states/connectModal'

const meta: Meta<typeof ConnectModal> = {
  title: 'Modals/ConnectModal',
  component: ConnectModal
}

export default meta

const Opened: React.FC = () => {
  const { setOpen } = useConnectModal()
  useEffect(() => {
    setOpen(true)
  }, [setOpen])
  return <ConnectModal />
}

export const Basic: StoryFn<typeof ConnectModal> = () => (
  <Web3Provider>
    <Opened />
  </Web3Provider>
)
