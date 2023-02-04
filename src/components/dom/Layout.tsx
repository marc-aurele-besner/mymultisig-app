import React from 'react'
import { Box, Center } from '@chakra-ui/react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Center>
      <Box w='100%' h='100%' p={6}>
        {children}
      </Box>
    </Center>
  )
}

export default Layout
