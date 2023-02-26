import React from 'react'
import { Button, Center, Text } from '@chakra-ui/react'

import { MultiSigExecTransactionArgs } from '../../models/MultiSigs'
import useExecTransaction from '../../hooks/useExecTransaction'

interface ExecuteRequestProps {
  multiSigAddress: `0x${string}`
  args: MultiSigExecTransactionArgs
}

const ExecuteRequest: React.FC<ExecuteRequestProps> = ({ multiSigAddress, args }) => {
  const { preparationIsError, isError, isLoading, isSuccess, write } = useExecTransaction(args, multiSigAddress)

  return (
    <>
      <Center>
        {isError && (
          <Text fontSize='xl' fontWeight='bold' color='red' m='0.5rem' pt='0.5rem'>
            Something went wrong
          </Text>
        )}
        {write && !preparationIsError ? (
          <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => write()} isDisabled={isLoading || isSuccess}>
            Execute transaction request
          </Button>
        ) : (
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            There was an error preparing the transaction.
          </Text>
        )}
      </Center>
    </>
  )
}

export default ExecuteRequest
