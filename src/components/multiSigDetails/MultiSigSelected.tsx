import React, { useState } from 'react'
import { Box, Button, HStack, Center } from '@chakra-ui/react'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import MultiSigRequestList from './MultiSigRequestList'
import CreateMultiSigRequestForm from '../forms/CreateMultiSigRequestForm'
import MultiSigRequestDetail from './MultiSigRequestDetail'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
  setSelectMultiSig: React.Dispatch<React.SetStateAction<`0x${string}` | undefined>>
}

const MultiSigSelected: React.FC<MultiSigListProps> = ({ multiSigAddress, address, setSelectMultiSig }) => {
  const { multiSigDetails } = useMultiSigDetails(multiSigAddress, address)
  const [action, setAction] = useState<string>('contract')
  const [selectRequest, setSelectRequest] = useState<string | null>(null)

  if (multiSigDetails == null) return null

  console.log('selectRequest', selectRequest)

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
            {selectRequest != null ? (
              <MultiSigRequestDetail
                multiSigAddress={multiSigAddress}
                multiSigDetails={multiSigDetails}
                multiSigRequestId={selectRequest}
                setSelectRequest={setSelectRequest}
              />
            ) : (
              <MultiSigRequestList
                multiSigAddress={multiSigAddress}
                multiSigDetails={multiSigDetails}
                setSelectRequest={setSelectRequest}
              />
            )}
          </>
        ) : (
          <CreateMultiSigRequestForm multiSigAddress={multiSigAddress} />
        )}
      </Box>
      <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setSelectMultiSig(undefined)}>
        Select a different MultiSig to use
      </Button>
    </>
  )
}

export default MultiSigSelected
