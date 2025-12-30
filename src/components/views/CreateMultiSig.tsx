import React, { useState, useEffect } from 'react'
import { Center, VStack, Text, Heading, Box, useColorModeValue } from '@chakra-ui/react'
import { useAccount, useNetwork } from 'wagmi'
import { motion } from 'framer-motion'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ConnectWallet from './ConnectWallet'
import CreateMultiSigForm from '../forms/CreateMultiSigForm'
import multiSigFactories from '../../constants/multiSigFactory'

const MotionBox = motion(Box)

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

const CreateMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()
  const multiSigFactory = multiSigFactories.find((factory) => factory.chainId === chain?.id)

  // Color mode values
  const mutedTextColor = useColorModeValue('gray.600', 'whiteAlpha.700')
  const cardBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.100')

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <Center>
      <BigCard maxW='900px' minH='60vh'>
        <Center>
          <VStack
            as={motion.div}
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            spacing={6}
            w='100%'
            py={{ base: 4, md: 6 }}>
            <MotionBox variants={itemVariants} textAlign='center' w='100%'>
              <Heading as='h1' fontSize={{ base: '2xl', md: '4xl' }} fontWeight='800' mb={2}>
                <Text as='span' bgGradient='linear(to-r, brand.400, accent.500)' bgClip='text'>
                  Create Your MultiSig
                </Text>
              </Heading>
              <Text fontSize='md' color={mutedTextColor}>
                Set up a new multi-signature wallet in just a few steps
              </Text>
            </MotionBox>

            {!isConnected || address === undefined || multiSigFactory === undefined ? (
              <MotionBox variants={itemVariants} w='100%'>
                <VStack spacing={4}>
                  {(!isConnected || address === undefined) && <ErrorCard>Please connect your wallet first</ErrorCard>}
                  {multiSigFactory === undefined && isConnected && (
                    <ErrorCard>No MultiSig Factory contract detected on this network</ErrorCard>
                  )}
                  <Box w='100%' p={6} borderRadius='xl' bg={cardBg} border='1px solid' borderColor={cardBorder}>
                    <ConnectWallet />
                  </Box>
                </VStack>
              </MotionBox>
            ) : (
              <MotionBox variants={itemVariants} w='100%'>
                <CreateMultiSigForm owner01={address.toString()} factory={multiSigFactory} />
              </MotionBox>
            )}
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default CreateMultiSig
