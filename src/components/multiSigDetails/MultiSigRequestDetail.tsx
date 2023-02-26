import React from 'react'
import { Box, Button, Center, HStack, Text } from '@chakra-ui/react'

import { MultiSigOnChainData } from '../../models/MultiSigs'
import useMultiSigRequestDetails from '../../hooks/useMultiSigRequestDetails'

interface MultiSigRequestDetailProps {
  multiSigAddress: `0x${string}`
  multiSigDetails: MultiSigOnChainData
  multiSigRequestId: string
  setSelectRequest: React.Dispatch<React.SetStateAction<string | null>>
}

const MultiSigRequestDetail: React.FC<MultiSigRequestDetailProps> = ({
  multiSigAddress,
  multiSigDetails,
  multiSigRequestId,
  setSelectRequest
}) => {
  const requestDetails = useMultiSigRequestDetails(multiSigRequestId)
  console.log('multiSigAddress', multiSigAddress, 'multiSigDetails', multiSigDetails, 'requestDetails', requestDetails)

  if (requestDetails == null) return null

  return (
    <>
      <Box border='1px' borderColor='white' borderRadius='5px' p='1rem'>
        <HStack key={`Request-Title`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Description
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.description}
          </Text>
        </HStack>
        <HStack key={`Request-Title`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Submitted date
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {new Date(Number(requestDetails.data.dateSubmitted)).toLocaleDateString()}
          </Text>
        </HStack>
        <HStack key={`Request-Title`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Target
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.request.to}
          </Text>
        </HStack>
        <HStack key={`Request-Title`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Data
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.request.data}
          </Text>
        </HStack>
        <HStack key={`Request-Title`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Value
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.request.value}
          </Text>
        </HStack>
        <HStack key={`Request-Title`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Tx. Gas
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.request.txnGas}
          </Text>
        </HStack>
        <HStack key={`Request-Title`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Signatures qty. / Threshold
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.signatures.length} / {multiSigDetails.threshold}
          </Text>
        </HStack>
      </Box>
      <Center>
        <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setSelectRequest(null)}>
          View a different request
        </Button>
      </Center>
    </>
  )
}

export default MultiSigRequestDetail
