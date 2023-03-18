import React from 'react'
import { Button, Center, Text } from '@chakra-ui/react'

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
  const { isError, isLoading, isSuccess, signTypedData } = useSignedMultiSigRequest(
    multiSigAddress,
    args,
    description,
    requestDetails,
    existingRequestRef
  )

  return (
    <>
      <Center>
        {isError && (
          <Text fontSize='xl' fontWeight='bold' color='red' m='0.5rem' pt='0.5rem'>
            Something went wrong
          </Text>
        )}
        <Button
          colorScheme='blue'
          m='1rem'
          mr='2rem'
          onClick={() => signTypedData()}
          isDisabled={isLoading || isSuccess}>
          Sign transaction request
        </Button>
      </Center>
    </>
  )
}

export default SignRequest
