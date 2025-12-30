import React from 'react'
import { Box, Center, VStack } from '@chakra-ui/react'

import HeaderBox from '../header/HeaderBox'
import FooterBox from '../footer/FooterBox'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      minH='100vh'
      position='relative'
      overflow='hidden'
    >
      {/* Animated background orbs */}
      <Box
        position='fixed'
        top='-20%'
        left='-10%'
        w='50vw'
        h='50vw'
        maxW='600px'
        maxH='600px'
        borderRadius='full'
        bg='radial-gradient(circle, rgba(56, 178, 172, 0.15) 0%, transparent 70%)'
        filter='blur(60px)'
        pointerEvents='none'
        animation='float 20s ease-in-out infinite'
        sx={{
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.95)' }
          }
        }}
      />
      <Box
        position='fixed'
        bottom='-20%'
        right='-10%'
        w='60vw'
        h='60vw'
        maxW='700px'
        maxH='700px'
        borderRadius='full'
        bg='radial-gradient(circle, rgba(0, 132, 255, 0.12) 0%, transparent 70%)'
        filter='blur(80px)'
        pointerEvents='none'
        animation='floatReverse 25s ease-in-out infinite'
        sx={{
          '@keyframes floatReverse': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(-40px, 30px) scale(1.08)' },
            '66%': { transform: 'translate(30px, -25px) scale(0.92)' }
          }
        }}
      />
      <Box
        position='fixed'
        top='40%'
        right='20%'
        w='30vw'
        h='30vw'
        maxW='400px'
        maxH='400px'
        borderRadius='full'
        bg='radial-gradient(circle, rgba(138, 75, 255, 0.08) 0%, transparent 70%)'
        filter='blur(50px)'
        pointerEvents='none'
        animation='floatSlow 30s ease-in-out infinite'
        sx={{
          '@keyframes floatSlow': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '50%': { transform: 'translate(-50px, 30px) rotate(180deg)' }
          }
        }}
      />
      
      {/* Grid pattern overlay */}
      <Box
        position='fixed'
        inset={0}
        pointerEvents='none'
        opacity={0.03}
        backgroundImage='linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)'
        backgroundSize='60px 60px'
      />

      {/* Main content */}
      <Center position='relative' zIndex={1}>
        <VStack
          w='100%'
          minH='100vh'
          spacing={0}
          justify='space-between'
        >
          <HeaderBox />
          <Box
            flex='1'
            w='100%'
            py={{ base: 4, md: 6 }}
            px={{ base: 2, md: 4 }}
          >
            {children}
          </Box>
          <FooterBox />
        </VStack>
      </Center>
    </Box>
  )
}

export default Layout
