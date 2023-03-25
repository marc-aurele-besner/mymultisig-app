import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Center, VStack, Text, Button } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

import BigCard from '../../../components/cards/BigCard'
import CreateMultiSigRequestForm from '../../../components/forms/CreateMultiSigRequestForm'
import useMultiSigs from '../../../states/multiSigs'
import useMultiSigDetails from '../../../hooks/useMultiSigDetails'

const Page: React.FC = () => {
  const router = useRouter()
  const { multisigAddress } = router.query
  const { address } = useAccount()
  const { multiSigDetails } = useMultiSigDetails(
    multisigAddress != null && typeof multisigAddress == 'string' ? (multisigAddress as `0x${string}`) : '0x',
    address ? (address as `0x${string}`) : '0x'
  )
  const { setSelectedMultiSigAddress } = useMultiSigs()

  useEffect(() => {
    if (multisigAddress && multisigAddress !== '0x') {
      setSelectedMultiSigAddress(multisigAddress as `0x${string}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multisigAddress])

  if (
    !address ||
    !multisigAddress ||
    multiSigDetails == null ||
    Array.isArray(multisigAddress) ||
    !multisigAddress.startsWith('0x')
  )
    return null

  return (
    <Center>
      <BigCard w='80vw' h='max'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Build a request
            </Text>
            <Center>
              <Link href={`/multisig/${multisigAddress}/buildRequest`}>
                <Button colorScheme='blue' m='1rem' mr='2rem'>
                  Build a request
                </Button>
              </Link>
              <Link href={`/multisig/${multisigAddress}/requests`}>
                <Button colorScheme='blue' m='1rem' mr='2rem'>
                  Consult requests
                </Button>
              </Link>
            </Center>
            <CreateMultiSigRequestForm multiSigAddress={multisigAddress as `0x${string}`} />
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Build a request' } }
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { multisigAddress: '0x' } }],
    fallback: true
  }
}

export default Page
