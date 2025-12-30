import React from 'react'
import { Box, HStack, Text } from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

interface ErrorCardProps {
  children: React.ReactNode
}

const MotionBox = motion(Box)

const ErrorCard: React.FC<ErrorCardProps> = ({ children }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      w={{ base: '100%', md: '94%' }}
      p={4}
      m={2}
      borderRadius='xl'
      bg='linear-gradient(135deg, rgba(245, 101, 101, 0.15) 0%, rgba(229, 62, 62, 0.15) 100%)'
      backdropFilter='blur(10px)'
      border='1px solid'
      borderColor='red.400'
      boxShadow='0 4px 20px rgba(245, 101, 101, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    >
      <HStack spacing={3} align='flex-start'>
        <WarningIcon color='red.400' boxSize={5} mt={0.5} />
        <Text fontSize='md' fontWeight='500' color='red.200' lineHeight='tall'>
          {children}
        </Text>
      </HStack>
    </MotionBox>
  )
}

export default ErrorCard
