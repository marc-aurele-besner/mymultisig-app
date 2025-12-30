import Link from 'next/link'
import React, { Fragment } from 'react'
import {
  Box,
  HStack,
  Text,
  useMediaQuery,
  useColorMode,
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
      bg='linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
      backdropFilter='blur(20px) saturate(180%)'
      border='1px solid'
      borderColor='whiteAlpha.100'
      boxShadow='0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      position='relative'
      zIndex={20}
      overflow='visible'
    >
      <HStack w='100%' align='center' justify='space-between' spacing={{ base: 2, md: 4 }}>
        <HStack spacing={{ base: 2, md: 3 }} align='center'>
          <HeaderLink name='MyMultiSig' link='/' icon={<LockIcon boxSize={5} />} isLogo />
          
          {isLargerThan800 ? (
            <Fragment>
              <Box h='24px' w='1px' bg='whiteAlpha.200' mx={2} />
              {menu.map((item, index) => (
                <MotionBox
                  key={`Link-${item.name}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                >
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
                color='whiteAlpha.900'
                size='sm'
                _hover={{ bg: 'whiteAlpha.100' }}
                _active={{ bg: 'whiteAlpha.200' }}
              />
              
              <Drawer isOpen={isOpen} placement='left' onClose={onClose} size='xs'>
                <DrawerOverlay backdropFilter='blur(10px)' bg='blackAlpha.600' />
                <DrawerContent
                  bg='linear-gradient(135deg, rgba(13, 26, 63, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%)'
                  backdropFilter='blur(20px)'
                  borderRight='1px solid'
                  borderColor='whiteAlpha.100'
                >
                  <DrawerCloseButton color='whiteAlpha.700' _hover={{ color: 'white' }} />
                  <DrawerHeader borderBottomWidth='1px' borderColor='whiteAlpha.100'>
                    <HStack spacing={2}>
                      <LockIcon color='brand.400' boxSize={5} />
                      <Text
                        fontSize='xl'
                        fontWeight='700'
                        bgGradient='linear(to-r, brand.300, accent.400)'
                        bgClip='text'
                      >
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
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Link href={item.link} onClick={onClose}>
                            <HStack
                              p={3}
                              borderRadius='lg'
                              spacing={3}
                              sx={{ transition: 'all 0.2s ease' }}
                              _hover={{
                                bg: 'whiteAlpha.100',
                                transform: 'translateX(4px)'
                              }}
                            >
                              <Box color='brand.400'>{item.icon}</Box>
                              <Text fontSize='md' fontWeight='500' color='whiteAlpha.900'>
                                {item.name}
                              </Text>
                            </HStack>
                          </Link>
                        </MotionBox>
                      ))}
                      
                      <Divider borderColor='whiteAlpha.100' my={4} />
                      
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
                color='whiteAlpha.800'
                size='sm'
                borderRadius='lg'
                _hover={{
                  bg: 'whiteAlpha.100',
                  color: 'brand.300'
                }}
                _active={{ bg: 'whiteAlpha.200' }}
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
