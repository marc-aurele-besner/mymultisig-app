import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { cardColors } from '../../styles/colors'

interface BigCardProps extends BoxProps {
  children: React.ReactNode
}

const BigCard: React.FC<BigCardProps> = ({ children, w = '100%', h = 'auto', maxW = '1200px', ...rest }) => {
  return (
    <Box w={w} h={h} maxW={maxW} p={{ base: 3, md: 4 }} m={{ base: 2, md: 2 }} mt={{ base: 3, md: 4 }} borderRadius={10} {...cardColors} {...rest}>
      {children}
    </Box>
  )
}

export default BigCard
