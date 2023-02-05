import React from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'

import BigCard from '../cards/BigCard'
import WalletButton from '../buttons/WalletButton'

const ConnectWallet: React.FC = () => {
  return (
    <Center>
      <BigCard w='60%' h='60%'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white'>
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
