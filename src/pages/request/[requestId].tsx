import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { ArrowLeftIcon } from 'lucide-react'

import { LoadingDots } from '@/components/ui/loading-dots'
import ConnectPrompt from '../../components/multiSigDetails/ConnectPrompt'
import MultiSigPageLayout from '../../components/multiSigDetails/MultiSigPageLayout'
import MultiSigRequestDetail from '../../components/multiSigDetails/MultiSigRequestDetail'
import useMultiSigRequestDetails from '../../hooks/useMultiSigRequestDetails'
import { walletHref } from '../../components/shell/navigation'

const Page: React.FC = () => {
  const router = useRouter()
  const { requestId } = router.query
  const { isConnected, address } = useAccount()
  // The request names its wallet, which lets the page sit inside that
  // wallet's shell (header, sections) instead of standing alone.
  const requestDetails = useMultiSigRequestDetails(typeof requestId === 'string' ? requestId : '')

  if (requestId == null || Array.isArray(requestId)) return null
  if (!isConnected || address == null) return <ConnectPrompt what='this request' />

  if (requestDetails == null) {
    return (
      <div className='flex w-full items-center justify-center rounded-xl border border-border bg-muted/30 p-6'>
        <LoadingDots label='Loading the request...' />
      </div>
    )
  }

  return (
    <MultiSigPageLayout multiSigAddress={requestDetails.multiSigAddress}>
      <div className='flex flex-col gap-4'>
        <Link
          href={walletHref(requestDetails.multiSigAddress, 'requests')}
          className='inline-flex w-fit items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline'
        >
          <ArrowLeftIcon className='h-3.5 w-3.5' />
          Back to the queue
        </Link>
        <MultiSigRequestDetail address={address} multiSigRequestId={requestId} />
      </div>
    </MultiSigPageLayout>
  )
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Request', noIndex: true } }
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { requestId: '01' } }],
    fallback: true
  }
}

export default Page
