import React from 'react'
import { Text } from '@chakra-ui/react'

import useMultiSigDetails from '../../hooks/useMultiSigDetails'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigList: React.FC<MultiSigListProps> = ({ multiSigAddress, address }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)

  if (!data || !data[0] || !data[5]) return null

  return (
    <>
      <Text fontSize='xl' fontWeight='bold' color='white' m='4rem' pt='2rem'>
        {data[0]?.toString()}
      </Text>
      <Text fontSize='xl' fontWeight='bold' color='white' m='4rem' pt='2rem'>
        {multiSigAddress}
      </Text>
    </>
  )
}

export default MultiSigList
