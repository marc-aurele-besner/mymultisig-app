import React from 'react'
import { Button, Center } from '@chakra-ui/react'

import { MultiSigExecTransactionArgs } from '../../models/MultiSigs'
import useSignedMultiSigRequest from '../../hooks/useSignedMultiSigRequest'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  args: MultiSigExecTransactionArgs
}

const SignRequest: React.FC<MultiSigListProps> = ({ multiSigAddress, args }) => {
  const { data, isError, isLoading, isSuccess, signTypedData } = useSignedMultiSigRequest(multiSigAddress, args)

  console.log(data, isError, isLoading, isSuccess)

  return (
    <>
      <Center>
        <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => signTypedData()}>
          Sign transaction request
        </Button>
      </Center>
    </>
  )
}

export default SignRequest
