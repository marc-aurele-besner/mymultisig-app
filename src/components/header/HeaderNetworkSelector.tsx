import React, { useState, useEffect } from 'react'
import { Box, Text, Menu, MenuButton, Button, Portal, MenuList, MenuItem, HStack } from '@chakra-ui/react'
import { ChevronDownIcon, CheckIcon } from '@chakra-ui/icons'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { motion } from 'framer-motion'
import { menuListColors, menuItemColors } from '../../styles/colors'

const MotionButton = motion(Button)

const HeaderNetworkSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { chain } = useNetwork()
  const { chains, switchNetwork } = useSwitchNetwork()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !chain || !chains) return null

  return (
    <Box>
      <Menu>
        <MenuButton
          as={MotionButton}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          rightIcon={<ChevronDownIcon />}
          size={{ base: 'sm', md: 'md' }}
          px={{ base: 3, md: 4 }}
          py={2}
          borderRadius='xl'
          fontWeight='500'
          bg='whiteAlpha.100'
          color='whiteAlpha.900'
          border='1px solid'
          borderColor='whiteAlpha.200'
          backdropFilter='blur(10px)'
          sx={{ transition: 'all 0.2s ease' }}
          _hover={{
            bg: 'whiteAlpha.200',
            borderColor: 'whiteAlpha.300'
          }}
          _active={{
            transform: 'scale(0.98)'
          }}
          _focus={{
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.3)'
          }}
        >
          <HStack spacing={2}>
            <Box w='8px' h='8px' borderRadius='full' bg='brand.400' />
            <Text fontSize={{ base: 'xs', md: 'sm' }}>{chain.name}</Text>
          </HStack>
        </MenuButton>
        <Portal>
          <MenuList
            {...menuListColors}
            minW='180px'
            p={2}
          >
            {chains.map((item) => (
              <MenuItem
                key={`MenuItem-${item.name}`}
                {...menuItemColors}
                borderRadius='lg'
                onClick={() => switchNetwork?.(item.id)}
              >
                <HStack w='100%' justify='space-between'>
                  <Text fontSize='md' fontWeight='500'>
                    {item.name}
                  </Text>
                  {chain.id === item.id && (
                    <CheckIcon color='brand.400' boxSize={3} />
                  )}
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  )
}

export default HeaderNetworkSelector
