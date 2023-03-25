import React from 'react'
import Link from 'next/link'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

import { MultiSigOnChainData } from '../../models/MultiSigs'
import useMultiSigRequests from '../../hooks/useMultiSigRequests'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigRequestListProps {
  multiSigAddress: `0x${string}`
  multiSigDetails: MultiSigOnChainData
}

const MultiSigRequestList: React.FC<MultiSigRequestListProps> = ({ multiSigAddress, multiSigDetails }) => {
  const requests = useMultiSigRequests(multiSigAddress)
  const { setSelectedMultiSigTransactionRequest } = useMultiSigs()

  if (multiSigDetails == null || requests == null) return null

  return (
    <>
      <Box border='1px' borderColor='white' borderRadius='5px' p='1rem'>
        {requests.length > 0 ? (
          requests.map((request) => (
            <HStack key={`Request-${request.data.id}`}>
              <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                {request.data.description}
              </Text>
              <Link
                href={`/request/${request.data.id}`}
                onClick={() => setSelectedMultiSigTransactionRequest(request.data.id)}>
                <Button colorScheme='blue' m='1rem' mr='2rem'>
                  Select
                </Button>
              </Link>
            </HStack>
          ))
        ) : (
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            No requests
          </Text>
        )}
      </Box>
    </>
  )
}

export default MultiSigRequestList
