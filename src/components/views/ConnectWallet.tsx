import React, { Fragment } from 'react'
import { Text, SimpleGrid, Box, VStack, Image, useColorModeValue } from '@chakra-ui/react'
import { useConnect } from 'wagmi'
import { motion } from 'framer-motion'
import ErrorCard from '../cards/ErrorCard'

const MotionBox = motion(Box)

const walletConfig = {
  metaMask: {
    name: 'MetaMask',
    icon: '/images/wallets/mm.png',
    description: 'Connect using MetaMask'
  },
  coinbaseWallet: {
    name: 'Coinbase',
    icon: '/images/wallets/cbw.png',
    description: 'Connect using Coinbase Wallet'
  },
  walletConnect: {
    name: 'WalletConnect',
    icon: '/images/wallets/wc.png',
    description: 'Scan with WalletConnect'
  },
  injected: {
    name: 'Browser Wallet',
    icon: '/images/wallets/injected.png',
    description: 'Use injected provider'
  }
}

const ConnectWallet: React.FC = () => {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

  // Color mode values
  const headingColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.500', 'whiteAlpha.600')
  const walletBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')
  const walletBorder = useColorModeValue('gray.200', 'whiteAlpha.100')
  const walletHoverBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const iconBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const walletTextColor = useColorModeValue('gray.800', 'white')

  return (
    <Fragment>
      <VStack spacing={4} w='100%' align='center'>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='600' color={headingColor} textAlign='center'>
          Connect your wallet
        </Text>
        <Text fontSize='sm' color={mutedColor} textAlign='center' maxW='400px'>
          Choose your preferred wallet to get started with MyMultiSig
        </Text>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w='100%' maxW='700px' pt={4}>
          {connectors.map((connector, index) => {
            const config = walletConfig[connector.id as keyof typeof walletConfig] || {
              name: connector.name,
              icon: '/images/wallets/injected.png',
              description: `Connect with ${connector.name}`
            }
            const isPending = isLoading && pendingConnector?.id === connector.id
            const isDisabled = isLoading && pendingConnector?.id !== connector.id

            return (
              <MotionBox
                key={connector.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                as='button'
                onClick={() => connect({ connector })}
                aria-disabled={isDisabled}
                w='100%'
                p={4}
                borderRadius='xl'
                bg={walletBg}
                border='1px solid'
                borderColor={isPending ? 'brand.400' : walletBorder}
                cursor={isDisabled ? 'not-allowed' : 'pointer'}
                opacity={isDisabled ? 0.5 : 1}
                sx={{ transition: 'all 0.2s ease' }}
                _hover={{
                  bg: isDisabled ? walletBg : walletHoverBg,
                  borderColor: isDisabled ? walletBorder : 'brand.400',
                  transform: isDisabled ? 'none' : 'translateY(-2px)',
                  boxShadow: isDisabled ? 'none' : '0 8px 25px rgba(56, 178, 172, 0.2)'
                }}
                _active={{
                  transform: 'scale(0.98)'
                }}
                position='relative'
                overflow='hidden'>
                {isPending && (
                  <Box
                    position='absolute'
                    inset={0}
                    bg='linear-gradient(90deg, transparent, rgba(56, 178, 172, 0.1), transparent)'
                    animation='shimmer 1.5s infinite'
                    sx={{
                      '@keyframes shimmer': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' }
                      }
                    }}
                  />
                )}
                <VStack spacing={3}>
                  <Box p={3} borderRadius='xl' bg={iconBg}>
                    <Image src={config.icon} alt={config.name} w='32px' h='32px' objectFit='contain' />
                  </Box>
                  <Text fontSize='sm' fontWeight='600' color={walletTextColor} textAlign='center'>
                    {config.name}
                  </Text>
                </VStack>
              </MotionBox>
            )
          })}
        </SimpleGrid>
      </VStack>

      {error && <ErrorCard>{error.message}</ErrorCard>}
    </Fragment>
  )
}

export default ConnectWallet
