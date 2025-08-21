import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { textColors } from '../../styles/colors'
import BigCard from '../cards/BigCard'
import ConnectWallet from './ConnectWallet'
import ConnectedWallet from './ConnectedWallet'
import Disclaimer from '../modals/Disclaimer'

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
          <VStack>
            <Text
              fontSize='3xl'
              fontWeight='extrabold'
              pb='1rem'
              bgGradient='linear(to-r, blue.500, blue.300)'
              bgClip='text'
            >
              Welcome to MyMultiSig.app
            </Text>
            <Text fontSize='xl' fontWeight='bold' m={{ base: '1rem', md: '2rem', lg: '4rem' }} pt={{ base: '1rem', md: '2rem' }} {...textColors}>
              A minimalistic Solidity smart contract for secure and streamlined transactions.
            </Text>
            <Text fontSize='xl' fontWeight='bold' pb='1rem' {...textColors}>
              This multisig tool simplifies the multisig process for an easy and convenient experience.
            </Text>
            {hasMounted && <>{!isConnected ? <ConnectWallet /> : <ConnectedWallet />}</>}
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default Welcome
