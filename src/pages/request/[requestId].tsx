import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'

import BigCard from '../../components/cards/BigCard'
import MultiSigRequestDetail from '../../components/multiSigDetails/MultiSigRequestDetail'
import useMultiSigs from '../../states/multiSigs'

const Page: React.FC = () => {
  const router = useRouter()
  const { requestId } = router.query
  const { isConnected, address } = useAccount()
  const { setSelectedMultiSigAddress } = useMultiSigs()

  if (!isConnected || address == null || requestId == null || Array.isArray(requestId)) return null

  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[1200px]">
        <div className="flex flex-col items-center">
          <h2 className="pb-4 text-2xl font-bold text-foreground">
            Multi signature request
          </h2>
          <div>
            <MultiSigRequestDetail address={address} multiSigRequestId={requestId} />
          </div>
          <Button asChild className="m-4">
            <Link href="/useYourMultiSig" onClick={() => setSelectedMultiSigAddress(null)}>
              Select a different MultiSig to use
            </Link>
          </Button>
        </div>
      </BigCard>
    </div>
  )
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Open existing multisig', noIndex: true } }
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { requestId: '01' } }],
    fallback: true
  }
}

export default Page
