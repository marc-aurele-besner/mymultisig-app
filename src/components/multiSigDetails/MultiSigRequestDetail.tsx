import React from 'react'
import { Box, Button, Center, HStack, Text } from '@chakra-ui/react'

import { MultiSigOnChainData } from '../../models/MultiSigs'
import SignRequest from '../buttons/SignRequest'
import ExecuteRequest from '../buttons/ExecuteRequest'
import useMultiSigRequestDetails from '../../hooks/useMultiSigRequestDetails'

interface MultiSigRequestDetailProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
  multiSigDetails: MultiSigOnChainData
  multiSigRequestId: string
  setSelectRequest: React.Dispatch<React.SetStateAction<string | null>>
}

const MultiSigRequestDetail: React.FC<MultiSigRequestDetailProps> = ({
  multiSigAddress,
  address,
  multiSigDetails,
  multiSigRequestId,
  setSelectRequest
}) => {
  const requestDetails = useMultiSigRequestDetails(multiSigRequestId)

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
        <HStack key={`Request-SubmittedDate`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Submitted date
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {new Date(Number(requestDetails.data.dateSubmitted)).toLocaleDateString()}
          </Text>
        </HStack>
        <HStack key={`Request-Target`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Target
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.request.to}
          </Text>
        </HStack>
        <HStack key={`Request-Data`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Data
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.request.data}
          </Text>
        </HStack>
        <HStack key={`Request-Value`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Value
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.request.value}
          </Text>
        </HStack>
        <HStack key={`Request-TxGas`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Tx. Gas
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.request.txnGas}
          </Text>
        </HStack>
        <HStack key={`Request-SignaturesVsThreshold`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Signatures qty. / Threshold
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.signatures.length} / {multiSigDetails.threshold}
          </Text>
        </HStack>
        {requestDetails.data.signatures.length >= multiSigDetails.threshold && (
          <HStack key={`Request-Execute`}>
            <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
              Execute this request
            </Text>
            <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
              <ExecuteRequest multiSigAddress={multiSigAddress} args={requestDetails.data.request} />
            </Text>
          </HStack>
        )}
        <HStack key={`Request-Sign`}>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Sign this request
          </Text>
          <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {requestDetails.data.ownerSigners.find((signature) => signature === address) ? (
              <Text color='green'>You already signed this request</Text>
            ) : (
              <SignRequest
                multiSigAddress={multiSigAddress}
                args={requestDetails.data.request}
                description={requestDetails.data.description}
                requestDetails={requestDetails.data}
                existingRequestRef={requestDetails.data.id}
              />
            )}
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
