import Link from 'next/link'
import React, { Fragment } from 'react'
import {
  Box,
  HStack,
  Text,
  useMediaQuery,
  useColorMode,
  useColorModeValue,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Divider
} from '@chakra-ui/react'
import { HamburgerIcon, MoonIcon, SunIcon, AddIcon, CheckCircleIcon, LinkIcon, LockIcon, InfoOutlineIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import HeaderLink from './HeaderLink'
import HeaderNetworkSelector from './HeaderNetworkSelector'
import { HeaderWalletSelector } from './HeaderWalletSelector'

const MotionBox = motion(Box)

const HeaderBox: React.FC = () => {
  const [isLargerThan800] = useMediaQuery('(min-width: 800px)', {
    ssr: true,
    fallback: false
  })
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Color mode values
  const headerBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
  )
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100')
  const boxShadow = useColorModeValue(
    '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
  )
  const iconColor = useColorModeValue('gray.700', 'whiteAlpha.900')
  const iconHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const iconActiveBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const dividerColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const drawerBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
    'linear-gradient(135deg, rgba(13, 26, 63, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%)'
  )
  const drawerBorderColor = useColorModeValue('gray.200', 'whiteAlpha.100')
  const drawerTextColor = useColorModeValue('gray.800', 'whiteAlpha.900')
  const drawerHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const brandColor = useColorModeValue('brand.600', 'brand.400')

  const menu = [
    {
      name: 'Create a MultiSig',
      link: '/createMultiSig',
      icon: <AddIcon boxSize={4} />
    },
    {
      name: 'Use your MultiSig',
      link: '/useYourMultiSig',
      icon: <CheckCircleIcon boxSize={4} />
    },
    {
      name: 'Integration',
      link: '/integration',
      icon: <LinkIcon boxSize={4} />
    },
    {
      name: 'About',
      link: '/about',
      icon: <InfoOutlineIcon boxSize={4} />
    }
  ]

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      w={{ base: '95%', md: '90vw', lg: '85vw' }}
      maxW='1400px'
      p={{ base: 3, md: 4 }}
      m={2}
      mt={{ base: 3, md: 4 }}
      borderRadius='2xl'
      bg={headerBg}
      backdropFilter='blur(20px) saturate(180%)'
      border='1px solid'
      borderColor={borderColor}
      boxShadow={boxShadow}
      position='relative'
      zIndex={20}
      overflow='visible'>
      <HStack w='100%' align='center' justify='space-between' spacing={{ base: 2, md: 4 }}>
        <HStack spacing={{ base: 2, md: 3 }} align='center'>
          <HeaderLink name='MyMultiSig' link='/' icon={<LockIcon boxSize={5} />} isLogo />

          {isLargerThan800 ? (
            <Fragment>
              <Box h='24px' w='1px' bg={dividerColor} mx={2} />
              {menu.map((item, index) => (
                <MotionBox
                  key={`Link-${item.name}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}>
                  <HeaderLink name={item.name} link={item.link} icon={item.icon} />
                </MotionBox>
              ))}
            </Fragment>
          ) : (
            <>
              <IconButton
                aria-label='Open menu'
                icon={<HamburgerIcon boxSize={5} />}
                onClick={onOpen}
                variant='ghost'
                color={iconColor}
                size='sm'
                _hover={{ bg: iconHoverBg }}
                _active={{ bg: iconActiveBg }}
              />

              <Drawer isOpen={isOpen} placement='left' onClose={onClose} size='xs'>
                <DrawerOverlay backdropFilter='blur(10px)' bg='blackAlpha.600' />
                <DrawerContent
                  bg={drawerBg}
                  backdropFilter='blur(20px)'
                  borderRight='1px solid'
                  borderColor={drawerBorderColor}>
                  <DrawerCloseButton color={iconColor} _hover={{ color: brandColor }} />
                  <DrawerHeader borderBottomWidth='1px' borderColor={drawerBorderColor}>
                    <HStack spacing={2}>
                      <LockIcon color={brandColor} boxSize={5} />
                      <Text fontSize='xl' fontWeight='700' bgGradient='linear(to-r, brand.400, accent.500)' bgClip='text'>
                        MyMultiSig
                      </Text>
                    </HStack>
                  </DrawerHeader>

                  <DrawerBody py={6}>
                    <VStack spacing={2} align='stretch'>
                      {menu.map((item, index) => (
                        <MotionBox
                          key={`MenuItem-${item.link}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}>
                          <Link href={item.link} onClick={onClose}>
                            <HStack
                              p={3}
                              borderRadius='lg'
                              spacing={3}
                              sx={{ transition: 'all 0.2s ease' }}
                              _hover={{
                                bg: drawerHoverBg,
                                transform: 'translateX(4px)'
                              }}>
                              <Box color={brandColor}>{item.icon}</Box>
                              <Text fontSize='md' fontWeight='500' color={drawerTextColor}>
                                {item.name}
                              </Text>
                            </HStack>
                          </Link>
                        </MotionBox>
                      ))}

                      <Divider borderColor={drawerBorderColor} my={4} />

                      <Box px={3}>
                        <HeaderNetworkSelector />
                      </Box>
                    </VStack>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </>
          )}
        </HStack>

        <HStack spacing={{ base: 2, md: 3 }} align='center'>
          {isLargerThan800 && (
            <>
              <HeaderNetworkSelector />
              <IconButton
                aria-label='Toggle color mode'
                onClick={toggleColorMode}
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                variant='ghost'
                color={iconColor}
                size='sm'
                borderRadius='lg'
                _hover={{
                  bg: iconHoverBg,
                  color: brandColor
                }}
                _active={{ bg: iconActiveBg }}
              />
            </>
          )}
          <HeaderWalletSelector />
        </HStack>
      </HStack>
    </MotionBox>
  )
}

export default HeaderBox
