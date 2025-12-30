import Link from 'next/link'
import React from 'react'
import { Box, HStack, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { LockIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const FooterBox: React.FC = () => {
  const footerBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
  )
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100')
  const boxShadow = useColorModeValue(
    '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
  )
  const copyrightColor = useColorModeValue('gray.500', 'whiteAlpha.500')
  const linkTextColor = useColorModeValue('gray.600', 'whiteAlpha.800')
  const linkIconColor = useColorModeValue('gray.400', 'whiteAlpha.500')
  const linkHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const brandColor = useColorModeValue('brand.600', 'brand.400')

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      w={{ base: '95%', md: '90vw', lg: '85vw' }}
      maxW='1400px'
      p={{ base: 4, md: 6 }}
      m={2}
      mb={{ base: 4, md: 6 }}
      borderRadius='2xl'
      bg={footerBg}
      backdropFilter='blur(20px) saturate(180%)'
      border='1px solid'
      borderColor={borderColor}
      boxShadow={boxShadow}>
      <HStack justify='space-between' align='center' flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={4}>
        {/* Logo and copyright */}
        <HStack spacing={3}>
          <Box
            p={2}
            borderRadius='lg'
            bg='linear-gradient(135deg, rgba(56, 178, 172, 0.2) 0%, rgba(0, 132, 255, 0.2) 100%)'>
            <LockIcon color={brandColor} boxSize={4} />
          </Box>
          <VStack align='flex-start' spacing={0}>
            <Text fontSize='md' fontWeight='700' bgGradient='linear(to-r, brand.400, accent.500)' bgClip='text'>
              MyMultiSig.app
            </Text>
            <Text fontSize='xs' color={copyrightColor}>
              © {new Date().getFullYear()} All rights reserved
            </Text>
          </VStack>
        </HStack>

        {/* Links */}
        <HStack spacing={4}>
          <Link href='https://github.com/marc-aurele-besner/mymultisig-contract' target='_blank' rel='noopener noreferrer'>
            <HStack
              px={3}
              py={2}
              borderRadius='lg'
              spacing={2}
              sx={{ transition: 'all 0.2s ease' }}
              _hover={{
                bg: linkHoverBg,
                transform: 'translateY(-1px)'
              }}>
              <Text fontSize='sm' fontWeight='500' color={linkTextColor} display={{ base: 'none', sm: 'block' }}>
                Smart Contracts
              </Text>
              <ExternalLinkIcon color={linkIconColor} boxSize={3} />
            </HStack>
          </Link>
          <Link href='https://github.com/marc-aurele-besner/mymultisig-app' target='_blank' rel='noopener noreferrer'>
            <HStack
              px={3}
              py={2}
              borderRadius='lg'
              spacing={2}
              sx={{ transition: 'all 0.2s ease' }}
              _hover={{
                bg: linkHoverBg,
                transform: 'translateY(-1px)'
              }}>
              <Text fontSize='sm' fontWeight='500' color={linkTextColor} display={{ base: 'none', sm: 'block' }}>
                Web App
              </Text>
              <ExternalLinkIcon color={linkIconColor} boxSize={3} />
            </HStack>
          </Link>
        </HStack>
      </HStack>
    </MotionBox>
  )
}

export default FooterBox
