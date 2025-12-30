import React from 'react'
import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

interface ErrorCardProps {
  children: React.ReactNode
}

const MotionBox = motion(Box)

const ErrorCard: React.FC<ErrorCardProps> = ({ children }) => {
  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, rgba(254, 178, 178, 0.5) 0%, rgba(252, 129, 129, 0.4) 100%)',
    'linear-gradient(135deg, rgba(245, 101, 101, 0.15) 0%, rgba(229, 62, 62, 0.15) 100%)'
  )
  const textColor = useColorModeValue('red.700', 'red.200')
  const iconColor = useColorModeValue('red.600', 'red.400')
  const borderColor = useColorModeValue('red.300', 'red.400')
  const boxShadow = useColorModeValue(
    '0 4px 20px rgba(245, 101, 101, 0.15)',
    '0 4px 20px rgba(245, 101, 101, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
  )

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      w={{ base: '100%', md: '94%' }}
      p={4}
      m={2}
      borderRadius='xl'
      bg={bgGradient}
      backdropFilter='blur(10px)'
      border='1px solid'
      borderColor={borderColor}
      boxShadow={boxShadow}>
      <HStack spacing={3} align='flex-start'>
        <WarningIcon color={iconColor} boxSize={5} mt={0.5} />
        <Text fontSize='md' fontWeight='500' color={textColor} lineHeight='tall'>
          {children}
        </Text>
      </HStack>
    </MotionBox>
  )
}

export default ErrorCard
