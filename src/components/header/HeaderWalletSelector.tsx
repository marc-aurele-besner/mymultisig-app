import React, { useState, useEffect } from 'react'
import { Box, Text, Menu, MenuButton, Button, MenuList, MenuItem, Portal, HStack, useColorModeValue } from '@chakra-ui/react'
import { ChevronDownIcon, CheckIcon } from '@chakra-ui/icons'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { motion } from 'framer-motion'
import { WalletIcon } from '../icons/wallet'

const MotionButton = motion(Button)

export const HeaderWalletSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { connector, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Color mode values for disconnected state
  const disconnectedBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const disconnectedHoverBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const disconnectedColor = useColorModeValue('gray.700', 'white')
  const disconnectedBorderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const disconnectedBorderHoverColor = useColorModeValue('gray.300', 'whiteAlpha.300')
  const walletIconColor = useColorModeValue('gray.600', 'white')

  // Menu colors
  const menuBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
    'linear-gradient(135deg, rgba(13, 26, 63, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)'
  )
  const menuBorderColor = useColorModeValue('gray.200', 'whiteAlpha.100')
  const menuItemColor = useColorModeValue('gray.700', 'whiteAlpha.900')
  const menuItemHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const menuItemHoverColor = useColorModeValue('brand.600', 'brand.300')
  const connectedLabelColor = useColorModeValue('gray.500', 'whiteAlpha.500')
  const connectedNameColor = useColorModeValue('gray.800', 'white')

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

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
          fontWeight='600'
          bg={connector ? 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)' : disconnectedBg}
          color={connector ? 'white' : disconnectedColor}
          border='1px solid'
          borderColor={connector ? 'transparent' : disconnectedBorderColor}
          boxShadow={connector ? '0 4px 20px rgba(56, 178, 172, 0.3)' : 'none'}
          backdropFilter={connector ? 'none' : 'blur(10px)'}
          sx={{ transition: 'all 0.2s ease' }}
          _hover={{
            bg: connector ? 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)' : disconnectedHoverBg,
            borderColor: connector ? 'transparent' : disconnectedBorderHoverColor,
            boxShadow: connector ? '0 6px 25px rgba(56, 178, 172, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
          _active={{
            transform: 'scale(0.98)'
          }}
          _focus={{
            outline: 'none',
            boxShadow: connector ? '0 4px 20px rgba(56, 178, 172, 0.3)' : '0 0 0 2px rgba(56, 178, 172, 0.3)'
          }}>
          {connector && address ? (
            <HStack spacing={2}>
              <Box w='8px' h='8px' borderRadius='full' bg='green.400' boxShadow='0 0 8px rgba(72, 187, 120, 0.6)' />
              <Text fontSize={{ base: 'xs', md: 'sm' }}>{truncateAddress(address)}</Text>
            </HStack>
          ) : (
            <HStack spacing={2}>
              <WalletIcon color={walletIconColor} width='18px' height='18px' />
              <Text display={{ base: 'none', md: 'block' }} fontSize='sm'>
                Connect
              </Text>
            </HStack>
          )}
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
            minW='200px'
            p={2}
            zIndex={1600}>
            {!connector ? (
              connectors.map((item) => (
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
                  onClick={() => connect?.({ connector: connectors.find((c) => c.id === item.id) })}>
                  <Text fontSize='md' fontWeight='500'>
                    {item.name}
                  </Text>
                </MenuItem>
              ))
            ) : (
              <>
                <Box px={3} py={2} mb={2}>
                  <Text fontSize='xs' color={connectedLabelColor} textTransform='uppercase' letterSpacing='wider'>
                    Connected with
                  </Text>
                  <HStack mt={1}>
                    <CheckIcon color='green.500' boxSize={3} />
                    <Text fontSize='sm' color={connectedNameColor} fontWeight='500'>
                      {connector.name}
                    </Text>
                  </HStack>
                </Box>
                <MenuItem
                  bg='transparent'
                  color='red.500'
                  fontWeight='500'
                  px={4}
                  py={3}
                  borderRadius='lg'
                  sx={{ transition: 'all 0.2s ease' }}
                  _hover={{
                    bg: 'rgba(245, 101, 101, 0.15)',
                    color: 'red.600'
                  }}
                  _focus={{
                    bg: 'rgba(245, 101, 101, 0.15)'
                  }}
                  onClick={() => disconnect?.()}>
                  <Text fontSize='md' fontWeight='500'>
                    Disconnect
                  </Text>
                </MenuItem>
              </>
            )}
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  )
}
