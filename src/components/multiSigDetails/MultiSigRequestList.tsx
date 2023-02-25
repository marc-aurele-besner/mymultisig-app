import React from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useMultiSigRequests from '../../hooks/useMultiSigRequests'

interface MultiSigRequestListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigRequestList: React.FC<MultiSigRequestListProps> = ({ multiSigAddress, address }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)
  const requests = useMultiSigRequests(multiSigAddress)

  if (!data || !data[0] || !data[5] || !requests || requests == null) return null

  return (
    <>
      <Box border='1px' borderColor='white' borderRadius='5px' p='1rem'>
        {requests.map((request) => (
          <HStack key={`Request-${request.data.id}`}>
            <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
              {request.data.description}
            </Text>
            <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => console.log('hello')}>
              Select
            </Button>
          </HStack>
        ))}
      </Box>
    </>
  )
}

export default MultiSigRequestList
