import React, { useState, useEffect } from 'react'
import { Box, Text, Menu, MenuButton, Button, MenuList, MenuItem, Portal } from '@chakra-ui/react'
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
          {...textColors}
          bg='transparent'
          border={'1px solid transparent'}
          _hover={{
            border: '1px solid white',
            borderRadius: '10px',
            color: 'gray.900'
          }}
          _focus={{
            outline: 'none',
            background: 'transparent',
            color: 'gray.900',
            border: '1px solid white',
            borderRadius: '10px'
          }}
          _active={{
            outline: 'none',
            background: 'transparent',
            color: 'gray.900',
            border: '1px solid white',
            borderRadius: '10px'
          }}>
          {connector ? connector.name : <WalletIcon color={textColors.color} width='36px' height='36px' />}
        </MenuButton>
        <Portal>
          <MenuList {...menuListColors}>
            {connectors.map((item) => (
              <MenuItem
                key={`MenuItem-${item.name}`}
                bg='gray.200'
                color='gray.900'
                onClick={() =>
                  connect !== undefined &&
                  connect({ connector: connectors.find((connector) => connector.id === item.id) })
                }>
                <Text
                  key={`LinkText-${item.name}`}
                  fontSize='lg'
                  fontWeight='bold'
                  color='gray.900'
                  pl='1rem'
                  _hover={{
                    color: 'gray.600'
                  }}>
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
                  color='gray.900'
                  pl='1rem'
                  _hover={{
                    color: 'gray.600'
                  }}>
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
