import React, { useState, useEffect } from 'react'
import { Box, Text, Menu, MenuButton, Button, MenuList, MenuItem, Portal, HStack } from '@chakra-ui/react'
import { ChevronDownIcon, CheckIcon } from '@chakra-ui/icons'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { motion } from 'framer-motion'
import { WalletIcon } from '../icons/wallet'
import { menuListColors, menuItemColors } from '../../styles/colors'

const MotionButton = motion(Button)

export const HeaderWalletSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { connector, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

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
          bg={connector ? 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)' : 'whiteAlpha.100'}
          color='white'
          border='1px solid'
          borderColor={connector ? 'transparent' : 'whiteAlpha.200'}
          boxShadow={connector ? '0 4px 20px rgba(56, 178, 172, 0.3)' : 'none'}
          backdropFilter={connector ? 'none' : 'blur(10px)'}
          sx={{ transition: 'all 0.2s ease' }}
          _hover={{
            bg: connector ? 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)' : 'whiteAlpha.200',
            borderColor: connector ? 'transparent' : 'whiteAlpha.300',
            boxShadow: connector ? '0 6px 25px rgba(56, 178, 172, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
          _active={{
            transform: 'scale(0.98)'
          }}
          _focus={{
            outline: 'none',
            boxShadow: connector ? '0 4px 20px rgba(56, 178, 172, 0.3)' : '0 0 0 2px rgba(56, 178, 172, 0.3)'
          }}
        >
          {connector && address ? (
            <HStack spacing={2}>
              <Box w='8px' h='8px' borderRadius='full' bg='green.400' boxShadow='0 0 8px rgba(72, 187, 120, 0.6)' />
              <Text fontSize={{ base: 'xs', md: 'sm' }}>{truncateAddress(address)}</Text>
            </HStack>
          ) : (
            <HStack spacing={2}>
              <WalletIcon color='white' width='18px' height='18px' />
              <Text display={{ base: 'none', md: 'block' }} fontSize='sm'>Connect</Text>
            </HStack>
          )}
        </MenuButton>
        <Portal>
          <MenuList
            {...menuListColors}
            minW='200px'
            p={2}
          >
            {!connector ? (
              connectors.map((item) => (
                <MenuItem
                  key={`MenuItem-${item.name}`}
                  {...menuItemColors}
                  borderRadius='lg'
                  onClick={() => connect?.({ connector: connectors.find((c) => c.id === item.id) })}
                >
                  <Text fontSize='md' fontWeight='500'>
                    {item.name}
                  </Text>
                </MenuItem>
              ))
            ) : (
              <>
                <Box px={3} py={2} mb={2}>
                  <Text fontSize='xs' color='whiteAlpha.500' textTransform='uppercase' letterSpacing='wider'>
                    Connected with
                  </Text>
                  <HStack mt={1}>
                    <CheckIcon color='green.400' boxSize={3} />
                    <Text fontSize='sm' color='white' fontWeight='500'>
                      {connector.name}
                    </Text>
                  </HStack>
                </Box>
                <MenuItem
                  {...menuItemColors}
                  borderRadius='lg'
                  onClick={() => disconnect?.()}
                  color='red.300'
                  _hover={{
                    bg: 'rgba(245, 101, 101, 0.15)',
                    color: 'red.200'
                  }}
                >
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
