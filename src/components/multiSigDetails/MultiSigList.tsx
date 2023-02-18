import React from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
  setSelectMultiSig: React.Dispatch<React.SetStateAction<`0x${string}` | undefined>>
}

const MultiSigList: React.FC<MultiSigListProps> = ({ multiSigAddress, address, setSelectMultiSig }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)

  if (!data || !data[0] || !data[5]) return null

  return (
    <>
      <Text fontSize='2xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
        Select a MultiSig to use
      </Text>
      <Box border='1px' borderColor='white' borderRadius='5px' p='1rem'>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {data[0]?.toString()}
          </Text>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rrem'>
            {multiSigAddress}
          </Text>
          <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setSelectMultiSig(multiSigAddress)}>
            Select
          </Button>
        </HStack>
      </Box>
    </>
  )
}

export default MultiSigList
