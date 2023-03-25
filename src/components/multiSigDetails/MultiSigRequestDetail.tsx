import React, { useEffect, useState } from 'react'
import { Box, Button, Center, HStack, Text, Textarea } from '@chakra-ui/react'

import { MultiSigOnChainData } from '../../models/MultiSigs'
import SignRequest from '../buttons/SignRequest'
import ExecuteRequest from '../buttons/ExecuteRequest'
import useMultiSigRequestDetails from '../../hooks/useMultiSigRequestDetails'
import useDeleteMultiSigRequest from '../../hooks/useDeleteMultiSigRequest'
import useResetMultiSigRequest from '../../hooks/useResetMultiSigRequest'

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
  const [isDeleted, setIsDeleted] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const requestDetails = useMultiSigRequestDetails(multiSigRequestId)
  const deleted = useDeleteMultiSigRequest(multiSigRequestId, requestDetails?.ref['@ref'].id, isDeleted)
  useResetMultiSigRequest(multiSigRequestId, requestDetails?.ref['@ref'].id, isReset)
  if (deleted) setSelectRequest(null)

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
          <Textarea isReadOnly defaultValue={requestDetails.data.request.data} />
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
        {requestDetails.data.isExecuted ? (
          <>
            <HStack key={`Request-Sign`}>
              <Text fontSize='xl' fontWeight='bold' color='green' m='0.5rem' pt='0.5rem'>
                This request has been executed
                {requestDetails.data.dateExecuted &&
                  ' on the ' + new Date(Number(requestDetails.data.dateExecuted)).toLocaleDateString()}
              </Text>
            </HStack>
          </>
        ) : (
          <>
            {requestDetails.data.signatures.length >= multiSigDetails.threshold && (
              <HStack key={`Request-Execute`}>
                <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                  Execute this request
                </Text>
                <ExecuteRequest
                  multiSigAddress={multiSigAddress}
                  args={requestDetails.data.request}
                  requestDetails={requestDetails.data}
                  existingRequestRef={requestDetails.data.id}
                />
              </HStack>
            )}
            <HStack key={`Request-Sign`}>
              <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                Sign this request
              </Text>
              <>
                {requestDetails.data.ownerSigners.find((signature) => signature === address) ? (
                  <Text color='green' fontSize='xl' fontWeight='bold' m='0.5rem' pt='0.5rem'>
                    You already signed this request
                  </Text>
                ) : (
                  <SignRequest
                    multiSigAddress={multiSigAddress}
                    args={requestDetails.data.request}
                    description={requestDetails.data.description}
                    requestDetails={requestDetails.data}
                    existingRequestRef={requestDetails.data.id}
                  />
                )}
              </>
            </HStack>
            <HStack key={`Request-ClearSignatures`}>
              <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                Clear signatures
              </Text>
              <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                <Button colorScheme='orange' m='1rem' mr='2rem' onClick={() => setIsReset(true)}>
                  Reset signatures
                </Button>
              </Text>
            </HStack>
            <HStack key={`Request-Delete`}>
              <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                Delete this request
              </Text>
              <Text fontSize='lg' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
                <Button colorScheme='red' m='1rem' mr='2rem' onClick={() => setIsDeleted(true)}>
                  Delete
                </Button>
              </Text>
            </HStack>
          </>
        )}
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
