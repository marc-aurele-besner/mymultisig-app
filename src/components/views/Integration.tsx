import React from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'

import BigCard from '../cards/BigCard'

const Integration: React.FC = () => {
  return (
    <Center>
      <BigCard w='80vw' h='60vh'>
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
