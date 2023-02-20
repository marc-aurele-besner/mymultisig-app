import React, { useState } from 'react'
import { Box, Button, Center, HStack, Text } from '@chakra-ui/react'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import SelectContract from '../inputs/SelectContract'
import SelectFunction from '../inputs/SelectFunction'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
  setSelectMultiSig: React.Dispatch<React.SetStateAction<`0x${string}` | undefined>>
}

const MultiSigSelected: React.FC<MultiSigListProps> = ({ multiSigAddress, address, setSelectMultiSig }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)

  if (!data || !data[0] || !data[5]) return null

  return (
    <>
      <Box border='1px' borderColor='white' borderRadius='5px' p='1rem'>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Contract to call:
          </Text>
          <SelectContract onChange={() => console.log('contract')} />
        </HStack>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            Function to call:
          </Text>
          <SelectFunction abi={MyMultiSig} onChange={() => console.log('contract')} />
        </HStack>
        <Center>
          <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => console.log('contract')}>
            Sign transaction
          </Button>
        </Center>
      </Box>
      <Button colorScheme='blue' m='1rem' mr='2rem' onClick={() => setSelectMultiSig(undefined)}>
        Select a different MultiSig to use
      </Button>
    </>
  )
}

export default MultiSigSelected
