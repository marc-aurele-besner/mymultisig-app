import React from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'

import MultiSigPageLayout from '../../components/multiSigDetails/MultiSigPageLayout'
import MultiSigOverview from '../../components/multiSigDetails/MultiSigOverview'

const Page: React.FC = () => {
  const router = useRouter()
  const { multisigAddress } = router.query
  const { address } = useAccount()

  if (address == null || multisigAddress == null || Array.isArray(multisigAddress) || !multisigAddress.startsWith('0x'))
    return null

  return (
    <MultiSigPageLayout multiSigAddress={multisigAddress as `0x${string}`}>
      <MultiSigOverview multiSigAddress={multisigAddress as `0x${string}`} />
    </MultiSigPageLayout>
  )
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Overview' } }
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { multisigAddress: '0x' } }],
    fallback: true
  }
}

export default Page
