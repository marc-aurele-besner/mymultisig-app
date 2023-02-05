import React from 'react'
import { Box } from '@chakra-ui/react'

interface BasicCardProps {
  children: React.ReactNode
}

const BasicCard: React.FC<BasicCardProps> = ({ children }) => {
  return (
    <Box
      w='100%'
      h='100%'
      p={4}
      m={2}
      mt={4}
      borderRadius={10}
      boxShadow='dark-lg'
      bgGradient='linear(to-r, cyan.300, cyan.600, purple.300)'>
      {children}
    </Box>
  )
}

export default BasicCard
