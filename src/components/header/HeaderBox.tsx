import Link from 'next/link'
import React, { Fragment } from 'react'
import {
  Box,
  HStack,
  Text,
  useMediaQuery,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  useColorMode,
  useStyleConfig,
  useColorModeValue,
  Portal,
  IconButton
} from '@chakra-ui/react'
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'
import HeaderLink from './HeaderLink'
import HeaderNetworkSelector from './HeaderNetworkSelector'
import { HeaderWalletSelector } from './HeaderWalletSelector'
import { menuItemColors, menuListColors } from '../../styles/colors'

const HeaderBox: React.FC = () => {
  const [isLargerThan800] = useMediaQuery('(min-width: 800px)', {
    ssr: true,
    fallback: false // return false on the server, and re-evaluate on the client side
  })
  const { colorMode, toggleColorMode } = useColorMode()

  const styles = useStyleConfig('Card')

  const menu = [
    {
      name: 'Create a MultiSig',
      link: '/createMultiSig',
      imagePath: '/images/create.png'
    },
    {
      name: 'Use your MultiSig',
      link: '/useYourMultiSig',
      imagePath: '/images/use.png'
    },
    {
      name: 'Integration',
      link: '/integration',
      imagePath: '/images/integration.png'
    }
  ]

  const mobileMenuColor = useColorModeValue('gray.900', 'white')

  return (
    <Box w={{ base: '100%', md: '90vw', lg: '80vw' }} maxW='1200px' h='100%' p={4} m={2} mt={4} position='relative' zIndex={20} overflow='visible' __css={styles}>
      <HStack w='100%' align='center' justify='space-between' flexWrap={{ base: 'nowrap', md: 'nowrap' }} spacing={{ base: 2, md: 4 }}>
        <HStack spacing={{ base: 2, md: 4 }} align='center'>
          <HeaderLink name='MyMultiSig.app' link='/' imagePath='/icons/android-icon-512x512.png' />
          {isLargerThan800 ? (
            <Fragment>
              {menu.map((item) => (
                <HeaderLink key={`Link-${item.name}`} name={item.name} link={item.link} imagePath={item.imagePath} />
              ))}
              <Button
                onClick={toggleColorMode}
                bgGradient='linear(to-r, blue.500, blue.600)'
                color='white'
                boxShadow='xl'
                transition='all 200ms ease-out'
                _hover={{ bgGradient: 'linear(to-r, blue.600, blue.700)', transform: 'translateY(-2px) scale(1.02)' }}
                _active={{ transform: 'translateY(0) scale(0.98)' }}
              >
                Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
              </Button>
            </Fragment>
          ) : (
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Open menu'
                icon={<HamburgerIcon />}
                color={mobileMenuColor}
                bg='transparent'
                size='sm'
                _focus={{
                  outline: 'none',
                  color: 'gray.600'
                }}
                _active={{
                  outline: 'none',
                  color: 'gray.600'
                }}
              />
              <Portal>
                <MenuList {...menuListColors} zIndex={1600}>
                  {menu.map((item) => (
                    <MenuItem key={`MenuItem-${item.link}`} {...menuItemColors}>
                      <Link key={`Link-${item.link}`} href={item.link}>
                        <Text
                          key={`LinkText-${item.link}`}
                          fontSize='lg'
                          fontWeight='bold'
                          pl='1rem'
                          color='inherit'>
                          {item.name}
                        </Text>
                      </Link>
                    </MenuItem>
                  ))}
                </MenuList>
              </Portal>
            </Menu>
          )}
        </HStack>
        <HStack spacing={{ base: 2, md: 4 }} ml={{ base: 0, md: 'auto' }} align='center'>
          <Box display={{ base: 'none', md: 'block' }}>
            <HeaderNetworkSelector />
          </Box>
          <HeaderWalletSelector />
        </HStack>
      </HStack>
    </Box>
  )
}

export default HeaderBox
