import React, { Fragment, useEffect } from 'react'
import { Text, useColorModeValue } from '@chakra-ui/react'

import useConfirmation from '../../hooks/useConfirmation'
import useMyMultiSigCreated from '../../hooks/useMyMultiSigCreated'
import { MultiSigConstructorArgs } from '../../models/MultiSigs'
import { verifyContract } from '../../utils/api'

interface ConfirmationCardProps {
  hash: `0x${string}`
  multiSigFactoryAddress: `0x${string}`
  constructorArgs: MultiSigConstructorArgs
}

const ConfirmationWithEventDetailCard: React.FC<ConfirmationCardProps> = ({
  multiSigFactoryAddress,
  constructorArgs
}) => {
  const { multiSigAddress } = useMyMultiSigCreated(multiSigFactoryAddress)
  const textColor = useColorModeValue('gray.800', 'white')

  const handleVerification = async (contractAddress: string, constructorArgs: MultiSigConstructorArgs) => {
    await verifyContract({
      contractAddress,
      constructorArgs
    })
  }

  useEffect(() => {
    if (multiSigAddress && constructorArgs) {
      handleVerification(multiSigAddress, constructorArgs)
    }
  }, [multiSigAddress, constructorArgs])

  return (
    <Fragment>
      {multiSigAddress && (
        <Text fontSize='lg' fontWeight='bold' color={textColor}>
          Address: {multiSigAddress}
        </Text>
      )}
    </Fragment>
  )
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ hash, multiSigFactoryAddress, constructorArgs }) => {
  const { data, error, isLoading, isSuccess } = useConfirmation(hash)
  const textColor = useColorModeValue('gray.800', 'white')
  const successColor = useColorModeValue('green.600', 'green.300')

  console.log('data', data)
  return (
    <Fragment>
      {isLoading && (
        <Text fontSize='lg' fontWeight='bold' color={textColor}>
          Loading...
        </Text>
      )}
      {error && (
        <Text fontSize='lg' fontWeight='bold' color={textColor}>
          Error: {error.message}
        </Text>
      )}
      {isSuccess && (
        <Fragment>
          <Text fontSize='lg' fontWeight='bold' color={successColor}>
            Your multisig contract has been deployed!
          </Text>
          <ConfirmationWithEventDetailCard
            hash={hash}
            multiSigFactoryAddress={multiSigFactoryAddress}
            constructorArgs={constructorArgs}
          />
        </Fragment>
      )}
    </Fragment>
  )
}

export default ConfirmationCard
