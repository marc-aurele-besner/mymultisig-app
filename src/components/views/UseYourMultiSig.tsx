import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount, useNetwork } from 'wagmi'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ConnectWallet from './ConnectWallet'
import ImageButton from '../buttons/ImageButton'
import MultiSigSelected from '../multiSigDetails/MultiSigSelected'
import MultiSigList from '../multiSigDetails/MultiSigList'
import useMultiSigs from '../../states/multiSigs'
import Link from 'next/link'

const UseYourMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()
  const { multiSigs, clearAllMultiSig } = useMultiSigs()
  const [selectMultiSig, setSelectMultiSig] = useState<`0x${string}` | undefined>()

  const filteredMultiSigs = chain ? multiSigs.filter((multiSig) => multiSig.chainId === chain.id) : []

  console.log('multiSigs', multiSigs, filteredMultiSigs)

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
                    {filteredMultiSigs.length === 0 ? (
                      <ErrorCard>
                        You don&apos;t have seem to have any multi-signatures contract on this network. <br />
                        Please create one first or import one.
                      </ErrorCard>
                    ) : (
                      filteredMultiSigs.map((multiSig) => (
                        <MultiSigList
                          key={multiSig.address}
                          multiSigAddress={multiSig.address}
                          address={address}
                          setSelectMultiSig={setSelectMultiSig}
                        />
                      ))
                    )}
                    <Link href='/importMultiSig'>
                      <ImageButton
                        placeholder='Import a multiSig'
                        imagePath='/images/import.png'
                        onClick={() => null}
                        // isLoading={isLoading}
                        // isDisabled={isLoading}
                      />
                    </Link>
                    <ImageButton
                      placeholder='Remove all multiSig'
                      imagePath='/images/clear.png'
                      onClick={() => clearAllMultiSig()}
                      // isLoading={isLoading}
                      // isDisabled={isLoading}
                    />
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
