import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ConnectWallet from './ConnectWallet'
import MultiSigSelected from '../multiSigDetails/MultiSigSelected'
import MultiSigList from '../multiSigDetails/MultiSigList'
import useMultiSigs from '../../states/multiSigs'

const UseYourMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const { multiSigs } = useMultiSigs()
  const [selectMultiSig, setSelectMultiSig] = useState<`0x${string}` | undefined>()

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
                {selectMultiSig ? (
                  <>
                    <MultiSigSelected
                      multiSigAddress={selectMultiSig}
                      address={address}
                      setSelectMultiSig={setSelectMultiSig}
                    />
                  </>
                ) : (
                  <>
                    {multiSigs.length === 0 ? (
                      <ErrorCard>You don&apos;t have any multiSig yet. Please create one first</ErrorCard>
                    ) : (
                      multiSigs.map((multiSig) => (
                        <MultiSigList
                          key={multiSig.address}
                          multiSigAddress={multiSig.address}
                          address={address}
                          setSelectMultiSig={setSelectMultiSig}
                        />
                      ))
                    )}
                  </>
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
