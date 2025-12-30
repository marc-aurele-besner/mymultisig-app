import React, { useEffect } from 'react'
import { useAccount, useNetwork, useDisconnect, useEnsAvatar, useEnsName, useSwitchNetwork } from 'wagmi'
import { Text, Box, HStack, VStack, Avatar, Button, Tooltip, useClipboard, useColorModeValue } from '@chakra-ui/react'
import { CheckIcon, CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import networks from '../../constants/networks'

const MotionBox = motion(Box)

const ConnectedWallet: React.FC = () => {
  const { address, connector, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { data: ensAvatar } = useEnsAvatar({ address })
  const { data: ensName } = useEnsName({ address })
  const { disconnect } = useDisconnect()
  const { hasCopied, onCopy } = useClipboard(address || '')

  // Color mode values
  const cardBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100')
  const headingColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.500', 'whiteAlpha.600')
  const iconColor = useColorModeValue('gray.500', 'whiteAlpha.700')
  const iconHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const iconHoverColor = useColorModeValue('gray.700', 'white')
  const brandColor = useColorModeValue('brand.600', 'brand.300')

  useEffect(() => {
    if (chain && switchNetwork && !networks.find((network) => network.id === chain.id)) {
      switchNetwork(networks[0].id)
    }
  }, [chain, switchNetwork])

  if (!isConnected || !address) {
    return null
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      w='100%'
      maxW='500px'
      mx='auto'>
      <VStack spacing={4} p={6} borderRadius='xl' bg={cardBg} border='1px solid' borderColor={borderColor}>
        <HStack spacing={4} w='100%'>
          <Avatar
            size='md'
            src={ensAvatar || undefined}
            name={ensName || address}
            bg='linear-gradient(135deg, #38b2ac 0%, #0084ff 100%)'
          />
          <VStack align='flex-start' spacing={1} flex={1}>
            <HStack>
              <Box w='8px' h='8px' borderRadius='full' bg='green.400' boxShadow='0 0 8px rgba(72, 187, 120, 0.6)' />
              <Text fontSize='xs' color='green.500' fontWeight='500' textTransform='uppercase' letterSpacing='wider'>
                Connected
              </Text>
            </HStack>
            <Text fontSize='lg' fontWeight='600' color={headingColor}>
              {ensName || truncateAddress(address)}
            </Text>
            {ensName && (
              <Text fontSize='xs' color={mutedColor}>
                {truncateAddress(address)}
              </Text>
            )}
          </VStack>
        </HStack>

        <HStack w='100%' justify='space-between' pt={2} borderTop='1px solid' borderColor={borderColor}>
          <HStack spacing={2}>
            <Text fontSize='xs' color={mutedColor}>
              via
            </Text>
            <Text fontSize='sm' fontWeight='500' color={brandColor}>
              {connector?.name}
            </Text>
          </HStack>

          <HStack spacing={2}>
            <Tooltip label={hasCopied ? 'Copied!' : 'Copy address'} placement='top'>
              <Button
                size='sm'
                variant='ghost'
                color={iconColor}
                onClick={onCopy}
                _hover={{ color: iconHoverColor, bg: iconHoverBg }}>
                {hasCopied ? <CheckIcon boxSize={4} color='green.400' /> : <CopyIcon boxSize={4} />}
              </Button>
            </Tooltip>

            {chain?.blockExplorers?.default && (
              <Tooltip label='View on explorer' placement='top'>
                <Button
                  as='a'
                  href={`${chain.blockExplorers.default.url}/address/${address}`}
                  target='_blank'
                  size='sm'
                  variant='ghost'
                  color={iconColor}
                  _hover={{ color: iconHoverColor, bg: iconHoverBg }}>
                  <ExternalLinkIcon boxSize={4} />
                </Button>
              </Tooltip>
            )}
          </HStack>
        </HStack>

        <Button
          w='100%'
          size='md'
          onClick={() => disconnect()}
          bg='rgba(245, 101, 101, 0.15)'
          color='red.500'
          border='1px solid'
          borderColor='red.400'
          _hover={{
            bg: 'rgba(245, 101, 101, 0.25)',
            color: 'red.400'
          }}
          _active={{
            bg: 'rgba(245, 101, 101, 0.3)'
          }}>
          Disconnect Wallet
        </Button>
      </VStack>
    </MotionBox>
  )
}

export default ConnectedWallet
