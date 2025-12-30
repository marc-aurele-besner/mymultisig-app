import React from 'react'
import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface BasicCardProps extends BoxProps {
  children: React.ReactNode
}

const BasicCard: React.FC<BasicCardProps> = ({ children, ...rest }) => {
  const cardBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)'
  )
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100')
  const hoverBorderColor = useColorModeValue('gray.300', 'whiteAlpha.200')
  const boxShadow = useColorModeValue(
    '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
  )
  const hoverBoxShadow = useColorModeValue(
    '0 8px 30px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    '0 8px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
  )

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // @ts-expect-error - framer-motion transition conflicts with Chakra transition
      transition={{ duration: 0.3, ease: 'easeOut' }}
      w='100%'
      p={{ base: 4, md: 5 }}
      m={{ base: 1, md: 2 }}
      borderRadius='xl'
      bg={cardBg}
      backdropFilter='blur(16px) saturate(180%)'
      border='1px solid'
      borderColor={borderColor}
      boxShadow={boxShadow}
      sx={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      _hover={{
        borderColor: hoverBorderColor,
        boxShadow: hoverBoxShadow,
        transform: 'translateY(-2px)'
      }}
      {...rest}>
      {children}
    </Box>
  )
}

export default BasicCard
