import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface BasicCardProps extends BoxProps {
  children: React.ReactNode
}

const BasicCard: React.FC<BasicCardProps> = ({ children, ...rest }) => {
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
      bg='linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)'
      backdropFilter='blur(16px) saturate(180%)'
      border='1px solid'
      borderColor='whiteAlpha.100'
      boxShadow='0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      sx={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      _hover={{
        borderColor: 'whiteAlpha.200',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        transform: 'translateY(-2px)'
      }}
      {...rest}>
      {children}
    </Box>
  )
}

export default BasicCard
