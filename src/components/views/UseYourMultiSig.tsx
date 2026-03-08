import React, { Fragment, useState, useEffect } from 'react'
import Link from 'next/link'
import { Center, VStack, Text, Heading, Box, HStack, Button } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import {} from '@chakra-ui/color-mode'
import { useAccount, useChainId, useChains } from 'wagmi'
import { DownloadIcon, DeleteIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ConnectWallet from './ConnectWallet'
import MultiSigList from '../multiSigDetails/MultiSigList'
import useMultiSigs from '../../states/multiSigs'
import { glassButtonColors } from '../../styles/colors'

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

const UseYourMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const { multiSigs, clearAllMultiSig } = useMultiSigs()

  const filteredMultiSigs = chain ? multiSigs.filter((multiSig) => multiSig.chainId === chain.id) : []

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <Center>
      <BigCard maxW='1000px'>
        <Center>
          <MotionVStack
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            gap={6}
            w='100%'
            py={{ base: 4, md: 6 }}
          >
            <MotionBox variants={itemVariants} textAlign='center' w='100%'>
              <Heading
                as='h1'
                fontSize={{ base: '2xl', md: '4xl' }}
                fontWeight='800'
                mb={2}
              >
                <Text
                  as='span'
                  bgGradient='linear(to-r, brand.300, accent.400)'
                  bgClip='text'
                >
                  Your MultiSig Wallets
                </Text>
              </Heading>
              <Text fontSize='md' color='whiteAlpha.700'>
                Manage and interact with your multi-signature wallets
              </Text>
            </MotionBox>

            {!isConnected || address === undefined ? (
              <MotionBox variants={itemVariants} w='100%'>
                <VStack gap={4}>
                  <ErrorCard>Please connect your wallet first</ErrorCard>
                  <Box
                    w='100%'
                    p={6}
                    borderRadius='xl'
                    bg='whiteAlpha.50'
                    border='1px solid'
                    borderColor='whiteAlpha.100'
                  >
                    <ConnectWallet />
                  </Box>
                </VStack>
              </MotionBox>
            ) : (
              <Fragment>
                {filteredMultiSigs.length === 0 ? (
                  <MotionBox variants={itemVariants} w='100%'>
                    <VStack gap={4}>
                      <Box
                        w='100%'
                        p={6}
                        borderRadius='xl'
                        bg='whiteAlpha.50'
                        border='1px solid'
                        borderColor='whiteAlpha.100'
                        textAlign='center'
                      >
                        <Text fontSize='lg' color='whiteAlpha.800' mb={2}>
                          No MultiSig wallets found
                        </Text>
                        <Text fontSize='sm' color='whiteAlpha.600'>
                          You don&apos;t have any multi-signature contracts on this network yet.
                          Create one or import an existing one to get started.
                        </Text>
                      </Box>
                    </VStack>
                  </MotionBox>
                ) : (
                  <MotionBox variants={itemVariants} w='100%'>
                    <VStack gap={3} w='100%'>
                      <Text
                        fontSize='sm'
                        color='whiteAlpha.600'
                        textTransform='uppercase'
                        letterSpacing='wider'
                        alignSelf='flex-start'
                      >
                        Select a MultiSig
                      </Text>
                      {filteredMultiSigs.map((multiSig, index) => (
                        <MotionBox
                          key={`${multiSig.address}-${index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          w='100%'
                        >
                          <MultiSigList
                            multiSigAddress={multiSig.address}
                            address={address}
                          />
                        </MotionBox>
                      ))}
                    </VStack>
                  </MotionBox>
                )}

                {/* Actions */}
                <MotionBox
                  variants={itemVariants}
                  w='100%'
                  pt={4}
                  borderTop='1px solid'
                  borderColor='whiteAlpha.100'
                >
                  <VStack gap={3}>
                    <Text
                      fontSize='sm'
                      color='whiteAlpha.600'
                      textTransform='uppercase'
                      letterSpacing='wider'
                      alignSelf='flex-start'
                    >
                      Actions
                    </Text>
                    <HStack gap={3} w='100%' flexWrap='wrap'>
                      <Link href='/importMultiSig'>
                        <Button
                          {...glassButtonColors}
                          size='md'
                        >
                          <HStack gap={2}>
                            <DownloadIcon />
                            <Text>Import a MultiSig</Text>
                          </HStack>
                        </Button>
                      </Link>
                      {multiSigs.length > 0 && (
                        <Button
                          onClick={() => clearAllMultiSig()}
                          size='md'
                          bg='rgba(245, 101, 101, 0.15)'
                          color='red.300'
                          border='1px solid'
                          borderColor='red.400'
                          _hover={{
                            bg: 'rgba(245, 101, 101, 0.25)',
                            color: 'red.200'
                          }}
                        >
                          <HStack gap={2}>
                            <DeleteIcon />
                            <Text>Clear All</Text>
                          </HStack>
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </MotionBox>
              </Fragment>
            )}
          </MotionVStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default UseYourMultiSig
