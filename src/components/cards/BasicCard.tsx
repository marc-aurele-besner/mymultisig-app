import React from 'react'
import { Box } from '@chakra-ui/react'
import { cardColors } from '../../styles/colors'

interface BasicCardProps {
  children: React.ReactNode
}

const BasicCard: React.FC<BasicCardProps> = ({ children }) => {
  return (
    <Box w='100%' h='100%' p={4} m={2} mt={4} borderRadius={10} {...cardColors}>
      {children}
    </Box>
  )
}

export default BasicCard
