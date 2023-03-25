import React from 'react'
import Link from 'next/link'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigList: React.FC<MultiSigListProps> = ({ multiSigAddress, address }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)

  if (!data || !data[1] || !data[5]) return null

  return (
    <>
      <Box border='1px' borderColor='white' borderRadius='5px' p='1rem'>
        <HStack>
          <Text fontSize='xl' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {data[0]?.toString()}
          </Text>
          <Text fontSize='sm' fontWeight='bold' color='white' m='0.5rem' pt='0.5rem'>
            {multiSigAddress}
          </Text>
          <Link href={`/multisig/${multiSigAddress}`}>
            <Button colorScheme='blue' m='1rem' mr='2rem'>
              Select
            </Button>
          </Link>
        </HStack>
      </Box>
    </>
  )
}

export default MultiSigList
