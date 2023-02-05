import React from 'react'
import { Center, VStack, Text, Divider } from '@chakra-ui/react'

import BigCard from '../cards/BigCard'
import WalletButton from '../buttons/WalletButton'

const ConnectWallet: React.FC = () => {
  return (
    <Center>
      <BigCard w='70vw' h='70vh'>
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
            <Text fontSize='2xl' fontWeight='bold' color='white' pt='2rem' pb='2rem'>
              Connect your wallet
            </Text>
            <WalletButton placeholder='MetaMask' imagePath='/images/wallets/mm.png' />
            <WalletButton placeholder='CoinBaseWallet' imagePath='/images/wallets/cbw.png' />
            <WalletButton placeholder='WalletConnect' imagePath='/images/wallets/wc.png' />
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default ConnectWallet
