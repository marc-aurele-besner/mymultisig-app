import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Center, VStack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

import BigCard from '../../components/cards/BigCard'
import MultiSigSelected from '../../components/multiSigDetails/MultiSigSelected'
import useMultiSigs from '../../states/multiSigs'

const Page: React.FC = () => {
  const router = useRouter()
  const { multisigAddress } = router.query
  const { address } = useAccount()
  const { setSelectedMultiSigAddress } = useMultiSigs()

  useEffect(() => {
    if (multisigAddress && multisigAddress !== '0x') {
      setSelectedMultiSigAddress(multisigAddress as `0x${string}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multisigAddress])

  if (!address || !multisigAddress || Array.isArray(multisigAddress) || !multisigAddress.startsWith('0x')) return null

  return (
    <Center>
      <BigCard w='80vw' h='max'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Use your multiSig
            </Text>
            <MultiSigSelected multiSigAddress={multisigAddress as `0x${string}`} address={address} />
          </VStack>
        </Center>
      </BigCard>
    </Center>
  )
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Use your MultiSig' } }
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { multisigAddress: '0x' } }],
    fallback: true
  }
}

export default Page
