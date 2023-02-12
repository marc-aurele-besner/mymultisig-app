import React, { useEffect } from 'react'
import { Text } from '@chakra-ui/react'

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
    <>
      {multiSigAddress && (
        <Text fontSize='lg' fontWeight='bold' color='white'>
          Address: {multiSigAddress}
        </Text>
      )}
    </>
  )
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ hash, multiSigFactoryAddress, constructorArgs }) => {
  const { data, error, isLoading, isSuccess } = useConfirmation(hash)

  console.log('data', data)
  return (
    <>
      {isLoading && (
        <Text fontSize='lg' fontWeight='bold' color='white'>
          Loading...
        </Text>
      )}
      {error && (
        <Text fontSize='lg' fontWeight='bold' color='white'>
          Error: {error.message}
        </Text>
      )}
      {isSuccess && (
        <>
          <Text fontSize='lg' fontWeight='bold' color='white'>
            Your multisig contract has been deployed!
          </Text>
          <ConfirmationWithEventDetailCard
            hash={hash}
            multiSigFactoryAddress={multiSigFactoryAddress}
            constructorArgs={constructorArgs}
          />
        </>
      )}
    </>
  )
}

export default ConfirmationCard
