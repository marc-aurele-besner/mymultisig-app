import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { Box, Button, Text, VStack, Center } from '@chakra-ui/react'

import BigCard from '../../components/cards/BigCard'
import MultiSigRequestDetail from '../../components/multiSigDetails/MultiSigRequestDetail'
import useMultiSigs from '../../states/multiSigs'

const Page: React.FC = () => {
  const router = useRouter()
  const { requestId } = router.query
  const { isConnected, address } = useAccount()
  const { setSelectedMultiSigAddress } = useMultiSigs()

  if (!isConnected || !address || !requestId || Array.isArray(requestId)) return null

  return (
    <Center>
      <BigCard w='80vw' h='max'>
        <Center>
          <VStack>
            <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
              Multi signature request
            </Text>
            <Box>
              <MultiSigRequestDetail address={address} multiSigRequestId={requestId} />
            </Box>
            <Link href='/useYourMultiSig' onClick={() => setSelectedMultiSigAddress(null)}>
              <Button colorScheme='blue' m='1rem' mr='2rem'>
                Select a different MultiSig to use
              </Button>
            </Link>
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
    paths: [{ params: { requestId: '01' } }],
    fallback: true
  }
}

export default Page
