import React from 'react'
import { Text } from '@chakra-ui/react'

import useConfirmation from '../../hooks/useConfirmation'

interface ConfirmationCardProps {
  hash: `0x${string}`
  multiSigFactoryAddress: `0x${string}`
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ hash, multiSigFactoryAddress }) => {
  const { isLoading, isSuccess, multiSigAddress } = useConfirmation(hash, multiSigFactoryAddress)

  return (
    <>
      {isLoading && (
        <Text fontSize='lg' fontWeight='bold' color='white'>
          Loading...
        </Text>
      )}
      {isSuccess && (
        <>
          <Text fontSize='lg' fontWeight='bold' color='white'>
            Your multisig contract has been deployed!
          </Text>
          {multiSigAddress && (
            <Text fontSize='lg' fontWeight='bold' color='white'>
              Address: {multiSigAddress}
            </Text>
          )}
        </>
      )}
    </>
  )
}

export default ConfirmationCard
