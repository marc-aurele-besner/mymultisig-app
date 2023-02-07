import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import ConnectWallet from './ConnectWallet'
import ConnectedWallet from './ConnectedWallet'

const Welcome: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <Center>
      <BigCard w='80vw' h='80vh'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Welcome to MyMultiSig.app
            </Text>
            <Text fontSize='xl' fontWeight='bold' color='white' m='4rem' pt='2rem'>
              A minimalistic Solidity smart contract for secure and streamlined transactions.
            </Text>
            <Text fontSize='xl' fontWeight='bold' color='white' pb='1rem'>
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
