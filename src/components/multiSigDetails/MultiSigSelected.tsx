import React, { useState } from 'react'
import { Box, Button, HStack, Center } from '@chakra-ui/react'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import MultiSigRequestList from './MultiSigRequestList'
import CreateMultiSigRequestForm from '../forms/CreateMultiSigRequestForm'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
  setSelectMultiSig: React.Dispatch<React.SetStateAction<`0x${string}` | undefined>>
}

const MultiSigSelected: React.FC<MultiSigListProps> = ({ multiSigAddress, address, setSelectMultiSig }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)
  const [action, setAction] = useState<string>('contract')

  if (!data || !data[0] || !data[5]) return null

  return (
    <>
      <Box>
        <HStack>
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
          <MultiSigRequestList multiSigAddress={multiSigAddress} address={address} />
        ) : (
          <CreateMultiSigRequestForm multiSigAddress={multiSigAddress} address={address} />
        )}
      </Box>
      <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setSelectMultiSig(undefined)}>
        Select a different MultiSig to use
      </Button>
    </>
  )
}

export default MultiSigSelected
