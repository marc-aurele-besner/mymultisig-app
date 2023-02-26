import React from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

import { MultiSigOnChainData } from '../../models/MultiSigs'
import useMultiSigRequests from '../../hooks/useMultiSigRequests'

interface MultiSigRequestListProps {
  multiSigAddress: `0x${string}`
  multiSigDetails: MultiSigOnChainData
  setSelectRequest: React.Dispatch<React.SetStateAction<string | null>>
}

const MultiSigRequestList: React.FC<MultiSigRequestListProps> = ({
  multiSigAddress,
  multiSigDetails,
  setSelectRequest
}) => {
  const requests = useMultiSigRequests(multiSigAddress)

  if (multiSigDetails == null || requests == null) return null

  return (
    <>
      <Box border='1px' borderColor='white' borderRadius='5px' p='1rem'>
        {requests.map((request) => (
          <HStack key={`Request-${request.data.id}`}>
            <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
              {request.data.description}
            </Text>
            <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setSelectRequest(request.data.id)}>
              Select
            </Button>
          </HStack>
        ))}
      </Box>
    </>
  )
}

export default MultiSigRequestList
