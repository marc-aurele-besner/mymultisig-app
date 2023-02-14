import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useNetwork } from 'wagmi'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ImportMultiSigForm from '../forms/ImportMultiSigForm'
import multiSigFactories from '../../constants/multiSigFactory'

const ImportMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { chain } = useNetwork()
  const multiSigFactory = multiSigFactories.find((factory) => factory.chainId === chain?.id)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <Center>
      <BigCard w='80vw' h='60vh'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Import your existing MultiSig
            </Text>
            {multiSigFactory ? (
              <ImportMultiSigForm factory={multiSigFactory} />
            ) : (
              <ErrorCard>No MultiSig Factory contract detected on this network</ErrorCard>
            )}
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default ImportMultiSig
