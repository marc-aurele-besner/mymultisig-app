import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import CreateMultiSigRequestForm from '../forms/CreateMultiSigRequestForm'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigSelected: React.FC<MultiSigListProps> = ({ multiSigAddress, address }) => {
  const { multiSigDetails } = useMultiSigDetails(multiSigAddress, address)
  const { setSelectedMultiSigAddress } = useMultiSigs()

  if (multiSigDetails == null) return null

  return (
    <>
      <div>
        <div className="flex justify-center px-6">
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/multisig/${multiSigAddress}/buildRequest`}>Build a request</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/multisig/${multiSigAddress}/requests`}>Consult requests</Link>
            </Button>
          </div>
        </div>
        <CreateMultiSigRequestForm multiSigAddress={multiSigAddress} />
      </div>
      <Button asChild variant="outline" className="mx-4 mt-4">
        <Link href="/useYourMultiSig" onClick={() => setSelectedMultiSigAddress(null)}>
          Select a different MultiSig to use
        </Link>
      </Button>
    </>
  )
}

export default MultiSigSelected
