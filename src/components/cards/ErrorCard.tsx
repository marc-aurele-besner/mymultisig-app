import React from 'react'
import { Box, Text } from '@chakra-ui/react'

interface ErrorCardProps {
  children: React.ReactNode
}

const ErrorCard: React.FC<ErrorCardProps> = ({ children }) => {
  return (
    <Box
      w='94%'
      p={4}
      m={2}
      mt={4}
      borderRadius={10}
      borderColor='red.400'
      bgGradient='linear(to-r, red.500, orange.400)'
      color='white'
      boxShadow='xl'
    >
      <Text fontSize='lg' fontWeight='bold'>
        Error: {children}
      </Text>
    </Box>
  )
}

export default ErrorCard
