import React from 'react'
import Link from 'next/link'
import { Box, Button, HStack, Center } from '@chakra-ui/react'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import CreateMultiSigRequestForm from '../forms/CreateMultiSigRequestForm'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigSelected: React.FC<MultiSigListProps> = ({ multiSigAddress, address }) => {
  const { multiSigDetails } = useMultiSigDetails(multiSigAddress, address)
  const { setSelectedMultiSigAddress } = useMultiSigs()

  if (multiSigDetails == null) return null

  return (
    <>
      <Box>
        <HStack pl='1.5rem' pr='1.5rem'>
          <Center>
            <Link href={`/multisig/${multiSigAddress}/buildRequest`}>
              <Button colorScheme='blue' m='1rem' mr='2rem'>
                Build a request
              </Button>
            </Link>
            <Link href={`/multisig/${multiSigAddress}/requests`}>
              <Button colorScheme='blue' m='1rem' mr='2rem'>
                Consult requests
              </Button>
            </Link>
          </Center>
        </HStack>
        <CreateMultiSigRequestForm multiSigAddress={multiSigAddress} />
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
