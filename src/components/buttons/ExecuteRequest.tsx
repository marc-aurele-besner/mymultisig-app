import React, { Fragment } from 'react'
import { Button, Center, VStack, HStack, Text, Textarea } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import {} from '@chakra-ui/color-mode'

import { MultiSigExecTransactionArgs, MultiSigTransactionRequest } from '../../models/MultiSigs'
import useExecTransaction from '../../hooks/useExecTransaction'

interface ExecuteRequestProps {
  multiSigAddress: `0x${string}`
  args: MultiSigExecTransactionArgs
  requestDetails: MultiSigTransactionRequest
  existingRequestRef: string
}

const ExecuteRequest: React.FC<ExecuteRequestProps> = ({
  multiSigAddress,
  args,
  requestDetails,
  existingRequestRef
}) => {
  const { preparationError, preparationIsError, isError, isPending, isSuccess, writeContract, reset } = useExecTransaction(
    args,
    multiSigAddress,
    requestDetails,
    existingRequestRef
  )
  return (
    <Fragment>
      <Center>
        {isError && (
          <Text fontSize='xl' fontWeight='bold' color='red' m='0.5rem' pt='0.5rem'>
            Something went wrong
          </Text>
        )}
        {!preparationIsError ? (
              <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => writeContract()} disabled={isPending || isSuccess}>
            Execute transaction request
          </Button>
        ) : (
          <VStack>
            <HStack w='100%'>
              <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                There was an error preparing the transaction.
              </Text>
            </HStack>
            <HStack w='100%'>
              <Textarea
                color={preparationIsError ? 'red' : 'white'}
                w='100%'
                readOnly
                defaultValue={
                  JSON.parse(JSON.stringify(preparationError))
                    ? JSON.parse(JSON.stringify(preparationError)).reason
                    : JSON.parse(JSON.stringify(preparationError))
                }
              />
            </HStack>
            <HStack>
              <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => reset()}>
                Reset
              </Button>
            </HStack>
          </VStack>
        )}
      </Center>
    </Fragment>
  )
}

export default ExecuteRequest
