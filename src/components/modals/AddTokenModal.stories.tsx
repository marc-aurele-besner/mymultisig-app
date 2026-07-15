import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import AddTokenModal from './AddTokenModal'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof AddTokenModal> = {
  title: 'Modals/AddTokenModal',
  component: AddTokenModal
}

export default meta

export const Default: StoryFn<typeof AddTokenModal> = () => (
  <Web3Provider>
    <AddTokenModal
      multiSigAddress='0x792e44D0E6De4B1b774f39952657943Ad2A50930'
      open={true}
      onOpenChange={() => {}}
    />
  </Web3Provider>
)
