import React, { useState, useEffect } from 'react'
import { Box, Text, Menu, MenuButton, Button, Portal, MenuList, MenuItem } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { textColors, menuListColors, menuItemColors } from '../../styles/colors'

const HeaderNetworkSelector: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { chain } = useNetwork()
  const { chains, switchNetwork } = useSwitchNetwork()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !chain || !chains) return <></>

  return (
    <Box ml={{ base: 0, md: '2rem' }}>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          {...textColors}
          bg='transparent'
          size={{ base: 'sm', md: 'md' }}
          px={{ base: 2, md: 4 }}
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
          {chain.name}
        </MenuButton>
        <Portal>
          <MenuList {...menuListColors}>
            {chains.map((item) => (
              <MenuItem
                key={`MenuItem-${item.name}`}
                {...menuItemColors}
                onClick={() => switchNetwork !== undefined && switchNetwork(item.id)}>
                <Text
                  key={`LinkText-${item.name}`}
                  fontSize='lg'
                  fontWeight='bold'
                  pl='1rem'
                  color='inherit'>
                  {item.name}
                </Text>
              </MenuItem>
            ))}
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  )
}

export default HeaderNetworkSelector
