import React from 'react'
import { Button, Center, Text, VStack } from '@chakra-ui/react'

import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useSignedMultiSigRequest from '../../hooks/useSignedMultiSigRequest'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  args: MultiSigExecTransactionArgs
  description: string
  requestDetails?: MultiSigTransactionRequest
  existingRequestRef?: string
}

const SignRequest: React.FC<MultiSigListProps> = ({
  multiSigAddress,
  args,
  description,
  requestDetails,
  existingRequestRef
}) => {
  const { isPrepareError, isError, prepareError, error, isLoading, isSuccess, signTypedData, reset } =
    useSignedMultiSigRequest(multiSigAddress, args, description, requestDetails, existingRequestRef)

  return (
    <>
      <Center>
        {isPrepareError || isError ? (
          <VStack>
            <Text fontSize='xl' fontWeight='bold' color='red' m='0.5rem' pt='0.5rem'>
              Something went wrong
            </Text>
            {error != null && (
              <Text fontSize='lg' color='red' m='0.5rem' pt='0.5rem'>
                {JSON.stringify(error)}
              </Text>
            )}
            {prepareError != null && (
              <Text fontSize='lg' color='red' m='0.5rem' pt='0.5rem'>
                {prepareError}
              </Text>
            )}
            <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => reset()} isDisabled={isLoading || isSuccess}>
              Try again
            </Button>
          </VStack>
        ) : (
          <Button
            colorScheme='blue'
            m='1rem'
            mr='2rem'
            onClick={() => signTypedData()}
            isDisabled={isLoading || isSuccess}>
            Sign transaction request
          </Button>
        )}
      </Center>
    </>
  )
}

export default SignRequest
