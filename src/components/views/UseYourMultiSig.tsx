import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ConnectWallet from './ConnectWallet'
import MultiSigList from '../multiSigDetails/MultiSigList'
import useMultiSigs from '../../states/multiSigs'

const UseYourMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const { multiSigs } = useMultiSigs()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <Center>
      <BigCard w='80vw' h='80vh'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Use your multiSig
            </Text>
            {!hasMounted || !isConnected || address === undefined ? (
              <>
                <ErrorCard>Please connect your wallet first</ErrorCard>
                <ConnectWallet />
              </>
            ) : (
              <>
                {multiSigs.length === 0 ? (
                  <ErrorCard>You don&apos;t have any multiSig yet. Please create one first</ErrorCard>
                ) : (
                  multiSigs.map((multiSig) => (
                    <MultiSigList key={multiSig.address} multiSigAddress={multiSig.address} address={address} />
                  ))
                )}
              </>
            )}
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default UseYourMultiSig
