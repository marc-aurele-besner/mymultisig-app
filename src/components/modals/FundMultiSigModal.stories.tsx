import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import FundMultiSigModal from './FundMultiSigModal'
import Web3Provider from '../web3/Web3Provider'

const meta: Meta<typeof FundMultiSigModal> = {
  title: 'Modals/FundMultiSigModal',
  component: FundMultiSigModal
}

export default meta

export const Default: StoryFn<typeof FundMultiSigModal> = () => (
  <Web3Provider>
    <FundMultiSigModal
      multiSigAddress='0x792e44D0E6De4B1b774f39952657943Ad2A50930'
      open={true}
      onOpenChange={() => {}}
    />
  </Web3Provider>
)
