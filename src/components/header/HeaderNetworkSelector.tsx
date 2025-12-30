import React, { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Menu,
  MenuButton,
  Button,
  Portal,
  MenuList,
  MenuItem,
  HStack,
  useColorModeValue
} from '@chakra-ui/react'
import { ChevronDownIcon, CheckIcon } from '@chakra-ui/icons'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { motion } from 'framer-motion'

const MotionButton = motion(Button)

const HeaderNetworkSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { chain } = useNetwork()
  const { chains, switchNetwork } = useSwitchNetwork()

  // Color mode values
  const buttonBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const buttonHoverBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const buttonColor = useColorModeValue('gray.700', 'whiteAlpha.900')
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const borderHoverColor = useColorModeValue('gray.300', 'whiteAlpha.300')
  const brandColor = useColorModeValue('brand.500', 'brand.400')

  // Menu colors
  const menuBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
    'linear-gradient(135deg, rgba(13, 26, 63, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)'
  )
  const menuBorderColor = useColorModeValue('gray.200', 'whiteAlpha.100')
  const menuItemColor = useColorModeValue('gray.700', 'whiteAlpha.900')
  const menuItemHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const menuItemHoverColor = useColorModeValue('brand.600', 'brand.300')

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
          bg={buttonBg}
          color={buttonColor}
          border='1px solid'
          borderColor={borderColor}
          backdropFilter='blur(10px)'
          sx={{ transition: 'all 0.2s ease' }}
          _hover={{
            bg: buttonHoverBg,
            borderColor: borderHoverColor
          }}
          _active={{
            transform: 'scale(0.98)'
          }}
          _focus={{
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.3)'
          }}>
          <HStack spacing={2}>
            <Box w='8px' h='8px' borderRadius='full' bg={brandColor} />
            <Text fontSize={{ base: 'xs', md: 'sm' }}>{chain.name}</Text>
          </HStack>
        </MenuButton>
        <Portal>
          <MenuList
            bg={menuBg}
            backdropFilter='blur(20px) saturate(180%)'
            border='1px solid'
            borderColor={menuBorderColor}
            borderRadius='xl'
            boxShadow='0 20px 40px rgba(0, 0, 0, 0.2)'
            py={2}
            minW='180px'
            p={2}
            zIndex={1600}>
            {chains.map((item) => (
              <MenuItem
                key={`MenuItem-${item.name}`}
                bg='transparent'
                color={menuItemColor}
                fontWeight='500'
                px={4}
                py={3}
                borderRadius='lg'
                sx={{ transition: 'all 0.2s ease' }}
                _hover={{
                  bg: menuItemHoverBg,
                  color: menuItemHoverColor
                }}
                _focus={{
                  bg: menuItemHoverBg
                }}
                onClick={() => switchNetwork?.(item.id)}>
                <HStack w='100%' justify='space-between'>
                  <Text fontSize='md' fontWeight='500'>
                    {item.name}
                  </Text>
                  {chain.id === item.id && <CheckIcon color={brandColor} boxSize={3} />}
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
