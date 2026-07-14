import React from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'

import MultiSigPageLayout from '../../../components/multiSigDetails/MultiSigPageLayout'
import MultiSigRequestList from '../../../components/multiSigDetails/MultiSigRequestList'
import useMultiSigDetails from '../../../hooks/useMultiSigDetails'

const Page: React.FC = () => {
  const router = useRouter()
  const { multisigAddress } = router.query
  const { address } = useAccount()
  const { multiSigDetails } = useMultiSigDetails(
    multisigAddress != null && typeof multisigAddress === 'string' ? (multisigAddress as `0x${string}`) : '0x',
    address != null ? (address as `0x${string}`) : '0x'
  )

  if (address == null || multisigAddress == null || Array.isArray(multisigAddress) || !multisigAddress.startsWith('0x'))
    return null

  return (
    <MultiSigPageLayout multiSigAddress={multisigAddress as `0x${string}`}>
      {multiSigDetails == null ? (
        <div className='flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 p-6'>
          <span className='h-3 w-3 animate-pulse rounded-full bg-primary' />
          <span className='text-sm text-muted-foreground'>Reading the multisig contract...</span>
        </div>
      ) : (
        <MultiSigRequestList multiSigAddress={multisigAddress as `0x${string}`} multiSigDetails={multiSigDetails} />
      )}
    </MultiSigPageLayout>
  )
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Transactions requests' } }
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { multisigAddress: '0x' } }],
    fallback: true
  }
}

export default Page
