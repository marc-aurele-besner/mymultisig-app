import React from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'

import BigCard from '../cards/BigCard'
import AdminActionForm from '../forms/AdminActionForm'
import ExtendedGovernancePanel from '../multiSigDetails/ExtendedGovernancePanel'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigSettingsProps {
  multiSigAddress: `0x${string}`
}

// MyMultiSig nonces are uint96; the contract starts emitting ContractEndOfLife
// within the last 1000 nonces.
const EOL_THRESHOLD = 2n ** 96n - 1000n

const MultiSigSettings: React.FC<MultiSigSettingsProps> = ({ multiSigAddress }) => {
  const { address } = useAccount()
  const { multiSigDetails, data } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { walletType } = useWalletType(multiSigAddress)
  const { multiSigs } = useMultiSigs()
  const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
  const owners = stored?.owners ?? []

  if (multiSigDetails == null) return null

  const nonceRaw = data != null ? BigInt(data[4] as bigint) : 0n
  const nearEndOfLife = nonceRaw >= EOL_THRESHOLD

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1200px]'>
        <div className='flex flex-col items-center gap-6'>
          <h2 className='text-2xl font-bold text-foreground'>Owners & settings</h2>
          <div className='flex gap-2'>
            <Button asChild>
              <Link href={`/multisig/${multiSigAddress}/buildRequest`}>Build a request</Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href={`/multisig/${multiSigAddress}/requests`}>Consult requests</Link>
            </Button>
          </div>

          {nearEndOfLife && (
            <div className='w-full rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive'>
              This wallet is approaching its end of life: fewer than 1000 transaction nonces remain. Plan a migration to
              a new wallet.
            </div>
          )}

          <div className='flex w-full flex-wrap gap-x-8 gap-y-2 rounded-lg border border-border p-4 text-sm text-foreground'>
            <span>
              Name: <span className='font-semibold'>{multiSigDetails.name}</span>
            </span>
            <span>
              Type:{' '}
              <span className='font-semibold'>
                {walletType == null ? '...' : walletType === 'extended' ? 'Extended' : 'Simple'}
              </span>
            </span>
            <span>
              Threshold:{' '}
              <span className='font-semibold'>
                {multiSigDetails.threshold} of {multiSigDetails.ownerCount}
              </span>
            </span>
            <span>
              Nonce: <span className='font-semibold'>{multiSigDetails.nonce}</span>
            </span>
          </div>

          <div className='flex w-full flex-col gap-2 rounded-lg border border-border p-4'>
            <h3 className='text-xl font-bold text-foreground'>Owners</h3>
            {owners.length > 0 ? (
              owners.map((owner) => (
                <span key={owner} className='font-mono text-sm text-foreground'>
                  {owner}
                  {address != null && owner.toLowerCase() === address.toLowerCase() && (
                    <span className='ml-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground'>You</span>
                  )}
                </span>
              ))
            ) : (
              <p className='text-sm text-muted-foreground'>
                The contract stores owners as a mapping, so the app tracks the list locally: it is seeded at
                create/import time and updated when owner operations execute. {multiSigDetails.ownerCount} owner
                {multiSigDetails.ownerCount === 1 ? ' is' : 's are'} registered on-chain.
              </p>
            )}
          </div>

          <AdminActionForm multiSigAddress={multiSigAddress} />

          {walletType === 'extended' && <ExtendedGovernancePanel multiSigAddress={multiSigAddress} owners={owners} />}
        </div>
      </BigCard>
    </div>
  )
}

export default MultiSigSettings
