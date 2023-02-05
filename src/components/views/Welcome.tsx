import React from 'react'
import { Center, VStack, Box, Text } from '@chakra-ui/react'
import { useConnect } from 'wagmi'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import WalletButton from '../buttons/WalletButton'

const ConnectWallet: React.FC = () => {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
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
            <WalletButton
              placeholder='MetaMask'
              imagePath='/images/wallets/mm.png'
              onClick={() => connect({ connector: connectors.find((connector) => connector.id === 'metaMask') })}
              isLoading={isLoading && pendingConnector && pendingConnector.id === 'metaMask'}
              isDisabled={isLoading && pendingConnector && pendingConnector.id !== 'metaMask'}
            />
            <WalletButton
              placeholder='CoinBaseWallet'
              imagePath='/images/wallets/cbw.png'
              onClick={() => connect({ connector: connectors.find((connector) => connector.id === 'coinbaseWallet') })}
              isLoading={isLoading && pendingConnector && pendingConnector.id === 'coinbaseWallet'}
              isDisabled={isLoading && pendingConnector && pendingConnector.id !== 'coinbaseWallet'}
            />
            <WalletButton
              placeholder='WalletConnect'
              imagePath='/images/wallets/wc.png'
              onClick={() => connect({ connector: connectors.find((connector) => connector.id === 'walletConnect') })}
              isLoading={isLoading && pendingConnector && pendingConnector.id === 'walletConnect'}
              isDisabled={isLoading && pendingConnector && pendingConnector.id !== 'walletConnect'}
            />
            <WalletButton
              placeholder='Injected'
              imagePath='/images/wallets/injected.png'
              onClick={() => connect({ connector: connectors.find((connector) => connector.id === 'injected') })}
              isLoading={isLoading && pendingConnector && pendingConnector.id === 'injected'}
              isDisabled={isLoading && pendingConnector && pendingConnector.id !== 'injected'}
            />

            {error && <ErrorCard>{error.message}</ErrorCard>}
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default ConnectWallet
