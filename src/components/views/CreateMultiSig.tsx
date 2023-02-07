import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount, useNetwork } from 'wagmi'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ConnectWallet from './ConnectWallet'
import CreateMultiSigForm from '../forms/CreateMultiSigForm'
import multiSigFactories from '../../constants/multiSigFactory'

const CreateMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()
  const multiSigFactory = multiSigFactories.find((factory) => factory.chainId === chain?.id)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <Center>
      <BigCard w='80vw' h='70vh'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Create your multiSig
            </Text>
            {!hasMounted || !isConnected || address === undefined || multiSigFactory === undefined ? (
              <>
                {!isConnected || (address === undefined && <ErrorCard>Please connect your wallet first</ErrorCard>)}
                {multiSigFactory === undefined && (
                  <ErrorCard>No MultiSig Factory contract detected on this network</ErrorCard>
                )}
                <ConnectWallet />
              </>
            ) : (
              <CreateMultiSigForm owner01={address.toString()} factory={multiSigFactory} />
            )}
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default CreateMultiSig
