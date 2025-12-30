import React from 'react'
import { Center, VStack, Text, Heading, Stack, Button, Link as ChakraLink, Box, SimpleGrid, HStack } from '@chakra-ui/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AddIcon, CheckCircleIcon, ExternalLinkIcon, LockIcon, ViewIcon, StarIcon, SettingsIcon } from '@chakra-ui/icons'

import BigCard from '../cards/BigCard'
import { buttonColors, glassButtonColors } from '../../styles/colors'

const MotionBox = motion(Box)
const MotionVStack = motion(VStack)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
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
    icon: <LockIcon boxSize={5} />,
    title: 'Lightweight Contracts',
    description: 'Clear logic, no unnecessary complexity. Easy to read and audit.'
  },
  {
    icon: <StarIcon boxSize={5} />,
    title: 'Gas-Conscious Design',
    description: 'Optimized for low transaction costs without compromising security.'
  },
  {
    icon: <ViewIcon boxSize={5} />,
    title: 'Full Transparency',
    description: 'Open-source codebase with security best practices built-in.'
  },
  {
    icon: <SettingsIcon boxSize={5} />,
    title: 'Modern Stack',
    description: 'Built with Next.js, Chakra UI, and wagmi for a responsive experience.'
  }
]

const About: React.FC = () => {
  return (
    <Center>
      <BigCard maxW='1200px' minH='60vh'>
        <Center>
          <MotionVStack
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            spacing={{ base: 6, md: 8 }}
            w='100%'
            py={{ base: 4, md: 8 }}
          >
            {/* Header */}
            <MotionBox variants={itemVariants} textAlign='center'>
              <Heading
                as='h1'
                fontSize={{ base: '3xl', md: '5xl' }}
                fontWeight='800'
                lineHeight='1.2'
                mb={4}
              >
                <Text
                  as='span'
                  bgGradient='linear(to-r, brand.300, accent.400)'
                  bgClip='text'
                >
                  About MyMultiSig
                </Text>
              </Heading>
              
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight='500'
                maxW='700px'
                mx='auto'
                color='whiteAlpha.800'
                lineHeight='tall'
              >
                A minimalistic, open-source multisig smart contract and web app 
                focused on security, simplicity, and auditability.
              </Text>
            </MotionBox>

            {/* Description */}
            <MotionBox variants={itemVariants} maxW='800px' textAlign='center'>
              <Text fontSize='md' color='whiteAlpha.700' lineHeight='tall'>
                Create a multisig, manage signers, and approve transactions with a clean UI. 
                The contracts are designed to be easy to read and verify, making audits straightforward.
              </Text>
            </MotionBox>

            {/* Features Grid */}
            <MotionBox variants={itemVariants} w='100%' pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w='100%'>
                {features.map((feature) => (
                  <MotionBox
                    key={feature.title}
                    variants={itemVariants}
                    p={5}
                    borderRadius='xl'
                    bg='whiteAlpha.50'
                    border='1px solid'
                    borderColor='whiteAlpha.100'
                    sx={{ transition: 'all 0.3s ease' }}
                    _hover={{
                      bg: 'whiteAlpha.100',
                      borderColor: 'whiteAlpha.200',
                      transform: 'translateY(-2px)'
                    }}
                  >
                    <HStack spacing={4} align='flex-start'>
                      <Box
                        p={3}
                        borderRadius='lg'
                        bg='linear-gradient(135deg, rgba(56, 178, 172, 0.2) 0%, rgba(0, 132, 255, 0.2) 100%)'
                        color='brand.300'
                      >
                        {feature.icon}
                      </Box>
                      <VStack align='flex-start' spacing={1}>
                        <Text fontSize='md' fontWeight='600' color='white'>
                          {feature.title}
                        </Text>
                        <Text fontSize='sm' color='whiteAlpha.700'>
                          {feature.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </MotionBox>

            {/* CTA Buttons */}
            <MotionBox variants={itemVariants} pt={4}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={4}
                justify='center'
                align='center'
              >
                <ChakraLink as={Link} href='/createMultiSig' _hover={{ textDecoration: 'none' }}>
                  <Button
                    leftIcon={<AddIcon />}
                    size='lg'
                    px={8}
                    {...buttonColors}
                  >
                    Create a MultiSig
                  </Button>
                </ChakraLink>
                <ChakraLink as={Link} href='/useYourMultiSig' _hover={{ textDecoration: 'none' }}>
                  <Button
                    leftIcon={<CheckCircleIcon />}
                    size='lg'
                    px={8}
                    {...glassButtonColors}
                  >
                    Use your MultiSig
                  </Button>
                </ChakraLink>
                <ChakraLink
                  href='https://github.com/marc-aurele-besner/mymultisig-contract'
                  target='_blank'
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button
                    leftIcon={<ExternalLinkIcon />}
                    size='lg'
                    px={8}
                    variant='ghost'
                    color='brand.300'
                    _hover={{ bg: 'whiteAlpha.100', color: 'brand.200' }}
                  >
                    View Smart Contracts
                  </Button>
                </ChakraLink>
              </Stack>
            </MotionBox>
          </MotionVStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default About
