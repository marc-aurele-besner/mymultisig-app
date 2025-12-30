import React, { useState, useEffect } from 'react'
import { Center, VStack, Text, Heading, Stack, Button, Link as ChakraLink } from '@chakra-ui/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { textColors, buttonColors } from '../../styles/colors'
import BigCard from '../cards/BigCard'
import ConnectWallet from './ConnectWallet'
import ConnectedWallet from './ConnectedWallet'
import Disclaimer from '../modals/Disclaimer'
import { AddIcon, CheckCircleIcon, LinkIcon } from '@chakra-ui/icons'

const MotionDiv = motion.div

const Welcome: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <Center>
      <Disclaimer />
      <BigCard maxW='1200px' minH='60vh'>
        <Center>
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ width: '100%' }}
          >
            <VStack spacing={{ base: 4, md: 6 }} w='100%'>
              <Heading
                as='h1'
                textAlign='center'
                fontSize={{ base: '3xl', md: '5xl' }}
                fontWeight='extrabold'
                bgGradient='linear(to-r, blue.500, blue.300)'
                bgClip='text'
              >
                Welcome to MyMultiSig.app
              </Heading>

              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='bold' textAlign='center' px={{ base: 4, md: 12 }} {...textColors}>
                A minimalistic Solidity smart contract for secure and streamlined transactions.
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight='medium' textAlign='center' px={{ base: 4, md: 12 }} {...textColors}>
                This multisig tool simplifies the process for a convenient, audit-friendly experience.
              </Text>

              <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} pt={{ base: 2, md: 4 }}>
                <ChakraLink as={Link} href='/createMultiSig' _hover={{ textDecoration: 'none' }}>
                  <Button leftIcon={<AddIcon />} {...buttonColors}>
                    Create a MultiSig
                  </Button>
                </ChakraLink>
                <ChakraLink as={Link} href='/useYourMultiSig' _hover={{ textDecoration: 'none' }}>
                  <Button leftIcon={<CheckCircleIcon />} {...buttonColors}>
                    Use your MultiSig
                  </Button>
                </ChakraLink>
                <ChakraLink as={Link} href='/integration' _hover={{ textDecoration: 'none' }}>
                  <Button leftIcon={<LinkIcon />} variant='outline' colorScheme='blue'>
                    Integration
                  </Button>
                </ChakraLink>
              </Stack>

              {hasMounted && <>{!isConnected ? <ConnectWallet /> : <ConnectedWallet />}</>}
            </VStack>
          </MotionDiv>
        </Center>
      </BigCard>
    </Center>
  )
}

export default Welcome
