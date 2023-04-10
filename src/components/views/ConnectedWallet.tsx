import React, { Fragment } from 'react'
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { Text } from '@chakra-ui/react'

import ImageButton from '../buttons/ImageButton'

const ConnectedWallet: React.FC = () => {
  const { address, connector, isConnected } = useAccount()
  const { data: ensAvatar } = useEnsAvatar({ address })
  const { data: ensName } = useEnsName({ address })
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return null
  }

  return (
    <Fragment>
      {ensName ? (
        <Text fontSize='2xl' fontWeight='bold' color='white' pt='1rem'>
          Wallet: {ensName}
        </Text>
      ) : (
        <Text fontSize='2xl' fontWeight='bold' color='white' pt='1rem'>
          Wallet: {address}
        </Text>
      )}
      <Text fontSize='2xl' fontWeight='bold' color='white' pt='1rem'>
        Connected with {connector && connector.name}
      </Text>

      {ensAvatar && (
        <Text fontSize='2xl' fontWeight='bold' color='white' pt='1rem'>
          ENS avatar {ensAvatar}
        </Text>
      )}
      <ImageButton
        placeholder='Disconnect'
        imagePath='/images/wallets/disconnect.png'
        onClick={() => disconnect()}
        // isLoading={isLoading}
        // isDisabled={isLoading}
      />
    </Fragment>
  )
}

export default ConnectedWallet
