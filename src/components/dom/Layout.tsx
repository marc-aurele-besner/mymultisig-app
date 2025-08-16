import React from 'react'
import { Box, Center, VStack } from '@chakra-ui/react'

import HeaderBox from '../header/HeaderBox'
import FooterBox from '../footer/FooterBox'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Center>
      <VStack w='100%' h='100%' p={1} position='relative' zIndex={0} overflow='visible'>
        <HeaderBox />
        <Box w='100%' h='100%' p={1} position='relative' zIndex={1} overflow='visible'>
          {children}
        </Box>
        <FooterBox />
      </VStack>
    </Center>
  )
}

export default Layout
