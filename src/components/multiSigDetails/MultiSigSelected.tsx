import React, { useState } from 'react'
import Link from 'next/link'
import { Box, Button, HStack, Center } from '@chakra-ui/react'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import MultiSigRequestList from './MultiSigRequestList'
import CreateMultiSigRequestForm from '../forms/CreateMultiSigRequestForm'
import MultiSigRequestDetail from './MultiSigRequestDetail'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigSelected: React.FC<MultiSigListProps> = ({ multiSigAddress, address }) => {
  const { multiSigDetails } = useMultiSigDetails(multiSigAddress, address)
  const [action, setAction] = useState<string>('contract')
  const { setSelectedMultiSigAddress, selectedMultiSigTransactionRequest } = useMultiSigs()

  if (multiSigDetails == null) return null

  return (
    <>
      <Box>
        <HStack pl='1.5rem' pr='1.5rem'>
          <Center>
            <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setAction('buildRequest')}>
              Build a request
            </Button>
            <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setAction('consultRequests')}>
              Consult requests
            </Button>
          </Center>
        </HStack>
        {action === 'consultRequests' ? (
          <>
            {selectedMultiSigTransactionRequest != null ? (
              <MultiSigRequestDetail address={address} multiSigRequestId={selectedMultiSigTransactionRequest} />
            ) : (
              <MultiSigRequestList multiSigAddress={multiSigAddress} multiSigDetails={multiSigDetails} />
            )}
          </>
        ) : (
          <CreateMultiSigRequestForm multiSigAddress={multiSigAddress} />
        )}
      </Box>
      <Link href='/useYourMultiSig' onClick={() => setSelectedMultiSigAddress(null)}>
        <Button colorScheme='blue' m='1rem' mr='2rem'>
          Select a different MultiSig to use
        </Button>
      </Link>
    </>
  )
}

export default MultiSigSelected
