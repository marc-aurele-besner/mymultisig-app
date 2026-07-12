import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'

import MultiSigSettings from '../../../components/views/MultiSigSettings'
import useMultiSigs from '../../../states/multiSigs'

const Page: React.FC = () => {
  const router = useRouter()
  const { multisigAddress } = router.query
  const { address } = useAccount()
  const { setSelectedMultiSigAddress } = useMultiSigs()

  useEffect(() => {
    if (multisigAddress != null && multisigAddress !== '0x') {
      setSelectedMultiSigAddress(multisigAddress as `0x${string}`)
    }
  }, [multisigAddress, setSelectedMultiSigAddress])

  if (
    address == null ||
    multisigAddress == null ||
    Array.isArray(multisigAddress) ||
    !multisigAddress.startsWith('0x')
  )
    return null

  return <MultiSigSettings multiSigAddress={multisigAddress as `0x${string}`} />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Owners & settings' } }
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { multisigAddress: '0x' } }],
    fallback: true
  }
}

export default Page
