import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface BigCardProps extends BoxProps {
  children: React.ReactNode
  hasGlow?: boolean
}

const BigCard: React.FC<BigCardProps> = ({ children, w = '100%', h = 'auto', maxW = '1200px', hasGlow = false, ...rest }) => {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // @ts-expect-error - framer-motion transition conflicts with Chakra transition
      transition={{ duration: 0.5, ease: 'easeOut' }}
      w={w}
      h={h}
      maxW={maxW}
      p={{ base: 6, md: 8, lg: 10 }}
      m={{ base: 2, md: 3 }}
      borderRadius='2xl'
      position='relative'
      bg='linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
      backdropFilter='blur(20px) saturate(180%)'
      border='1px solid'
      borderColor='whiteAlpha.100'
      boxShadow='0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      overflow='hidden'
      _before={hasGlow ? {
        content: '""',
        position: 'absolute',
        inset: '-2px',
        borderRadius: 'inherit',
        padding: '2px',
        background: 'linear-gradient(135deg, rgba(56, 178, 172, 0.4), rgba(0, 132, 255, 0.4), rgba(138, 75, 255, 0.4))',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMaskComposite: 'xor',
        pointerEvents: 'none',
        animation: 'borderGlow 4s ease-in-out infinite'
      } : undefined}
      sx={{
        '@keyframes borderGlow': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 }
        }
      }}
      {...rest}
    >
      {/* Inner glow effect at top */}
      <Box
        position='absolute'
        top={0}
        left='10%'
        right='10%'
        h='1px'
        bg='linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
        pointerEvents='none'
      />
      {children}
    </Box>
  )
}

export default BigCard
