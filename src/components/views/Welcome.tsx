import React, { useState, useEffect } from 'react'
import { Center, VStack, Text, Heading, Stack, Button, Link as ChakraLink, Box, SimpleGrid } from '@chakra-ui/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { buttonColors, glassButtonColors } from '../../styles/colors'
import BigCard from '../cards/BigCard'
import ConnectWallet from './ConnectWallet'
import ConnectedWallet from './ConnectedWallet'
import Disclaimer from '../modals/Disclaimer'
import { AddIcon, CheckCircleIcon, LinkIcon, LockIcon, StarIcon, ViewIcon } from '@chakra-ui/icons'

const MotionBox = motion(Box)
const MotionVStack = motion(VStack)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
}

const features = [
  {
    icon: <LockIcon boxSize={6} />,
    title: 'Secure by Design',
    description: 'Minimalistic smart contract architecture for maximum security and auditability.'
  },
  {
    icon: <ViewIcon boxSize={6} />,
    title: 'Full Transparency',
    description: 'Open-source contracts with clear, readable logic for easy verification.'
  },
  {
    icon: <StarIcon boxSize={6} />,
    title: 'Gas Efficient',
    description: 'Optimized for low transaction costs without compromising on security.'
  }
]

const Welcome: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <Center>
      <Disclaimer />
      <BigCard maxW='1200px' minH='70vh' hasGlow>
        <Center>
          <MotionVStack
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            spacing={{ base: 6, md: 8 }}
            w='100%'
            py={{ base: 4, md: 8 }}>
            {/* Hero Section */}
            <MotionBox variants={itemVariants} textAlign='center'>
              <Heading
                as='h1'
                fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                fontWeight='800'
                lineHeight='1.1'
                mb={4}>
                <Text as='span' bgGradient='linear(to-r, brand.300, accent.400, brand.400)' bgClip='text'>
                  Secure Multi-Signature
                </Text>
                <br />
                <Text as='span' color='white'>
                  for the Modern Web3
                </Text>
              </Heading>

              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight='500'
                maxW='700px'
                mx='auto'
                color='whiteAlpha.800'
                lineHeight='tall'>
                A minimalistic Solidity smart contract for secure and streamlined multi-signature transactions. Simple,
                auditable, and powerful.
              </Text>
            </MotionBox>

            {/* CTA Buttons */}
            <MotionBox variants={itemVariants}>
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} justify='center' align='center'>
                <ChakraLink as={Link} href='/createMultiSig' _hover={{ textDecoration: 'none' }}>
                  <Button leftIcon={<AddIcon />} size='lg' px={8} {...buttonColors}>
                    Create a MultiSig
                  </Button>
                </ChakraLink>
                <ChakraLink as={Link} href='/useYourMultiSig' _hover={{ textDecoration: 'none' }}>
                  <Button leftIcon={<CheckCircleIcon />} size='lg' px={8} {...glassButtonColors}>
                    Use your MultiSig
                  </Button>
                </ChakraLink>
                <ChakraLink as={Link} href='/integration' _hover={{ textDecoration: 'none' }}>
                  <Button
                    leftIcon={<LinkIcon />}
                    size='lg'
                    px={8}
                    variant='ghost'
                    color='brand.300'
                    _hover={{ bg: 'whiteAlpha.100', color: 'brand.200' }}>
                    Integration
                  </Button>
                </ChakraLink>
              </Stack>
            </MotionBox>

            {/* Features Grid */}
            <MotionBox variants={itemVariants} w='100%' pt={{ base: 4, md: 8 }}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }} w='100%'>
                {features.map((feature) => (
                  <MotionBox
                    key={feature.title}
                    variants={itemVariants}
                    p={{ base: 5, md: 6 }}
                    borderRadius='xl'
                    bg='whiteAlpha.50'
                    border='1px solid'
                    borderColor='whiteAlpha.100'
                    sx={{ transition: 'all 0.3s ease' }}
                    _hover={{
                      bg: 'whiteAlpha.100',
                      borderColor: 'whiteAlpha.200',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)'
                    }}>
                    <VStack align='flex-start' spacing={3}>
                      <Box
                        p={3}
                        borderRadius='lg'
                        bg='linear-gradient(135deg, rgba(56, 178, 172, 0.2) 0%, rgba(0, 132, 255, 0.2) 100%)'
                        color='brand.300'>
                        {feature.icon}
                      </Box>
                      <Text fontSize='lg' fontWeight='600' color='white'>
                        {feature.title}
                      </Text>
                      <Text fontSize='sm' color='whiteAlpha.700' lineHeight='tall'>
                        {feature.description}
                      </Text>
                    </VStack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </MotionBox>

            {/* Wallet Connection Section */}
            <MotionBox
              variants={itemVariants}
              w='100%'
              pt={{ base: 4, md: 6 }}
              borderTop='1px solid'
              borderColor='whiteAlpha.100'
              mt={{ base: 4, md: 6 }}>
              {hasMounted && <VStack spacing={4}>{!isConnected ? <ConnectWallet /> : <ConnectedWallet />}</VStack>}
            </MotionBox>
          </MotionVStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default Welcome
