import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
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

  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[1200px]">
        <div className="flex flex-col items-center">
          <h2 className="pb-4 text-2xl font-bold text-foreground">
            Use your multiSig
          </h2>
          <MultiSigSelected
            multiSigAddress={multisigAddress as `0x${string}`}
            address={address}
          />
        </div>
      </BigCard>
    </div>
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
