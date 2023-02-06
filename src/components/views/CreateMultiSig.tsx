import React, { useState, useEffect } from 'react'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount, useNetwork } from 'wagmi'

import BigCard from '../cards/BigCard'
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

  if (!hasMounted || !isConnected || address === undefined || multiSigFactory === undefined) {
    return null
  }

  return (
    <Center>
      <BigCard w='70vw' h='80vh'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Create your multiSig
            </Text>
            <CreateMultiSigForm
              owner01={address.toString()}
              factory={multiSigFactory}
              handleCreateMultiSig={() => null}
            />
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export default CreateMultiSig
