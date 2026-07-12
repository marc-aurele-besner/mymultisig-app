import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'

import BigCard from '../../../components/cards/BigCard'
import CreateMultiSigRequestForm from '../../../components/forms/CreateMultiSigRequestForm'
import useMultiSigs from '../../../states/multiSigs'
import useMultiSigDetails from '../../../hooks/useMultiSigDetails'

const Page: React.FC = () => {
  const router = useRouter()
  const { multisigAddress } = router.query
  const { address } = useAccount()
  const { multiSigDetails } = useMultiSigDetails(
    multisigAddress != null && typeof multisigAddress === 'string'
      ? (multisigAddress as `0x${string}`)
      : '0x',
    address != null ? (address as `0x${string}`) : '0x'
  )
  const { setSelectedMultiSigAddress } = useMultiSigs()

  useEffect(() => {
    if (multisigAddress != null && multisigAddress !== '0x') {
      setSelectedMultiSigAddress(multisigAddress as `0x${string}`)
    }
  }, [multisigAddress, setSelectedMultiSigAddress])

  if (
    address == null ||
    multisigAddress == null ||
    multiSigDetails == null ||
    Array.isArray(multisigAddress) ||
    !multisigAddress.startsWith('0x')
  )
    return null

  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[1200px]">
        <div className="flex flex-col items-center">
          <h2 className="pb-4 text-2xl font-bold text-foreground">
            Build a request
          </h2>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/multisig/${multisigAddress}/buildRequest`}>
                Build a request
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/multisig/${multisigAddress}/requests`}>
                Consult requests
              </Link>
            </Button>
          </div>
          <CreateMultiSigRequestForm multiSigAddress={multisigAddress as `0x${string}`} />
        </div>
      </BigCard>
    </div>
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
