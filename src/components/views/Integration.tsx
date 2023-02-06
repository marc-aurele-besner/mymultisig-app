import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'

const Integration: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected, address } = useAccount()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !isConnected || address === undefined) {
    return null
  }

  return (
    <Center>
      <BigCard w='70vw' h='80vh'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Integration
            </Text>
            <Text fontSize='xl' fontWeight='bold' color='white' m='4rem' pt='2rem'>
              This section is under construction
            </Text>
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default Integration
