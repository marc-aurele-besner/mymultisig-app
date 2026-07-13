import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useAdminEventSync from '../../hooks/useAdminEventSync'
import CreateMultiSigRequestForm from '../forms/CreateMultiSigRequestForm'
import useMultiSigs from '../../states/multiSigs'
import { EOL_NONCE_THRESHOLD } from '../../constants/limits'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigSelected: React.FC<MultiSigListProps> = ({ multiSigAddress, address }) => {
  const { multiSigDetails, data } = useMultiSigDetails(multiSigAddress, address)
  const { setSelectedMultiSigAddress } = useMultiSigs()
  useAdminEventSync(multiSigAddress)

  if (multiSigDetails == null) return null

  const nonceRaw = data != null ? BigInt(data[4] as bigint) : 0n
  const nearEndOfLife = nonceRaw >= EOL_NONCE_THRESHOLD

  return (
    <>
      <div>
        {nearEndOfLife && (
          <div className="mx-6 mb-4 rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            This wallet is approaching its end of life: fewer than 1000 transaction nonces remain. Plan a migration to
            a new wallet.
          </div>
        )}
        <div className="flex justify-center px-6">
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/multisig/${multiSigAddress}/buildRequest`}>Build a request</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/multisig/${multiSigAddress}/requests`}>Consult requests</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/multisig/${multiSigAddress}/settings`}>Owners & settings</Link>
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
