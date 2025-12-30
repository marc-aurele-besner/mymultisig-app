import React, { useEffect } from 'react'
import { useAccount, useNetwork, useDisconnect, useEnsAvatar, useEnsName, useSwitchNetwork } from 'wagmi'
import { Text, Box, HStack, VStack, Avatar, Button, Tooltip, useClipboard } from '@chakra-ui/react'
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
      mx='auto'
    >
      <VStack
        spacing={4}
        p={6}
        borderRadius='xl'
        bg='whiteAlpha.50'
        border='1px solid'
        borderColor='whiteAlpha.100'
      >
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
              <Text fontSize='xs' color='green.400' fontWeight='500' textTransform='uppercase' letterSpacing='wider'>
                Connected
              </Text>
            </HStack>
            <Text fontSize='lg' fontWeight='600' color='white'>
              {ensName || truncateAddress(address)}
            </Text>
            {ensName && (
              <Text fontSize='xs' color='whiteAlpha.600'>
                {truncateAddress(address)}
              </Text>
            )}
          </VStack>
        </HStack>

        <HStack w='100%' justify='space-between' pt={2} borderTop='1px solid' borderColor='whiteAlpha.100'>
          <HStack spacing={2}>
            <Text fontSize='xs' color='whiteAlpha.600'>via</Text>
            <Text fontSize='sm' fontWeight='500' color='brand.300'>
              {connector?.name}
            </Text>
          </HStack>
          
          <HStack spacing={2}>
            <Tooltip label={hasCopied ? 'Copied!' : 'Copy address'} placement='top'>
              <Button
                size='sm'
                variant='ghost'
                color='whiteAlpha.700'
                onClick={onCopy}
                _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
              >
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
                  color='whiteAlpha.700'
                  _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                >
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
          color='red.300'
          border='1px solid'
          borderColor='red.400'
          _hover={{
            bg: 'rgba(245, 101, 101, 0.25)',
            color: 'red.200'
          }}
          _active={{
            bg: 'rgba(245, 101, 101, 0.3)'
          }}
        >
          Disconnect Wallet
        </Button>
      </VStack>
    </MotionBox>
  )
}

export default ConnectedWallet
