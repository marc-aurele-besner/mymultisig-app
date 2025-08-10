import React, { useState, useEffect } from 'react'
import { Box, Text, Menu, MenuButton, Button, MenuList, MenuItem, Portal, HStack } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { WalletIcon } from '../icons/wallet'
import { textColors, menuListColors, menuItemColors } from '../../styles/colors'

export const HeaderWalletSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return <></>

  return (
    <Box ml='2rem'>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          color={connector ? textColors.color : 'white'}
          bg='transparent'
          border={'1px solid transparent'}
          _hover={{
            border: '1px solid white',
            borderRadius: '10px',
            color: 'white'
          }}
          _focus={{
            outline: 'none',
            background: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '10px'
          }}
          _active={{
            outline: 'none',
            background: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '10px'
          }}>
          {connector ? (
            connector.name
          ) : (
            <HStack spacing='2'>
              <WalletIcon color={'white'} width='24px' height='24px' />
              <Text color={'white'} fontWeight='bold'>Connect Wallet</Text>
            </HStack>
          )}
        </MenuButton>
        <Portal>
          <MenuList {...menuListColors}>
            {connectors.map((item) => (
              <MenuItem
                key={`MenuItem-${item.name}`}
                {...menuItemColors}
                onClick={() =>
                  connect !== undefined &&
                  connect({ connector: connectors.find((connector) => connector.id === item.id) })
                }>
                <Text
                  key={`LinkText-${item.name}`}
                  fontSize='lg'
                  fontWeight='bold'
                  pl='1rem'>
                  {item.name}
                </Text>
              </MenuItem>
            ))}
            {connector && (
              <MenuItem
                key={`MenuItem-disconnect`}
                {...menuItemColors}
                onClick={() => disconnect !== undefined && disconnect()}>
                <Text
                  key={`LinkText-disconnect`}
                  fontSize='lg'
                  fontWeight='bold'
                  pl='1rem'>
                  Disconnect
                </Text>
              </MenuItem>
            )}
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  )
}
