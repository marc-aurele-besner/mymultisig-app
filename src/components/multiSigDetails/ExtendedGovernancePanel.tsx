import React, { useState } from 'react'
import { useAccount, useChainId, useChains, useReadContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import TextInput from '../inputs/TextInput'
import useExtendedDetails from '../../hooks/useExtendedDetails'
import useTakeOverOwnership from '../../hooks/useTakeOverOwnership'

interface ExtendedGovernancePanelProps {
  multiSigAddress: `0x${string}`
  owners: string[]
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const formatDuration = (seconds: bigint) => {
  const days = Number(seconds / 86400n)
  if (days > 0) return `${days} day${days === 1 ? '' : 's'}`
  return `${Number(seconds)} seconds`
}

const TakeOverButton: React.FC<{ multiSigAddress: `0x${string}`; owner: `0x${string}` }> = ({
  multiSigAddress,
  owner
}) => {
  const { writeContract, isPending, isSuccess } = useTakeOverOwnership(multiSigAddress, owner)
  return (
    <Button variant='destructive' onClick={() => writeContract()} disabled={isPending || isSuccess}>
      {isSuccess ? 'Seat claimed' : 'Take over this seat now'}
    </Button>
  )
}

// Extended wallets only: read-side of the governance surface — request policy,
// inactivity delegation per owner, takeover CTA for a connected delegatee, and
// a nonce-status checker. Mutations live in AdminActionForm.
const ExtendedGovernancePanel: React.FC<ExtendedGovernancePanelProps> = ({ multiSigAddress, owners }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const { allowOnlyOwnerRequest, minimumTransferInactiveOwnershipAfter, ownerSettings } = useExtendedDetails(
    multiSigAddress,
    owners
  )
  const [nonceToCheck, setNonceToCheck] = useState('')
  const { data: nonceUsed } = useReadContract({
    chainId: chain?.id,
    address: multiSigAddress,
    abi: MyMultiSigExtended,
    functionName: 'isNonceUsed',
    args: [/^\d+$/.test(nonceToCheck) ? BigInt(nonceToCheck) : 0n],
    query: { enabled: /^\d+$/.test(nonceToCheck) }
  })

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000))

  return (
    <div className='flex w-full flex-col gap-4 rounded-lg border border-border p-4'>
      <h3 className='text-xl font-bold text-foreground'>Extended governance</h3>
      <div className='flex flex-wrap gap-x-8 gap-y-2 text-sm text-foreground'>
        <span>
          Request policy:{' '}
          <span className='font-semibold'>
            {allowOnlyOwnerRequest == null ? '...' : allowOnlyOwnerRequest ? 'owners only' : 'anyone can propose'}
          </span>
        </span>
        <span>
          Minimum inactivity window:{' '}
          <span className='font-semibold'>
            {minimumTransferInactiveOwnershipAfter == null
              ? '...'
              : minimumTransferInactiveOwnershipAfter === 0n
                ? 'not set'
                : formatDuration(minimumTransferInactiveOwnershipAfter)}
          </span>
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        <span className='text-sm font-semibold text-foreground'>Owner delegation</span>
        {owners.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            No owners on record for this wallet. Import it as an owner or run an owner operation to populate the list.
          </p>
        )}
        {owners.map((owner) => {
          const settings = ownerSettings[owner.toLowerCase()]
          const hasDelegate = settings != null && settings.delegate !== ZERO_ADDRESS
          const takeoverAt = settings != null ? settings.lastAction + settings.transferInactiveOwnershipAfter : 0n
          const takeoverOpen = hasDelegate && settings.lastAction > 0n && takeoverAt < nowSeconds
          const isConnectedDelegate =
            hasDelegate && address != null && settings.delegate.toLowerCase() === address.toLowerCase()
          return (
            <div
              key={owner}
              className='flex flex-wrap items-center justify-between gap-2 rounded border border-border p-3'
            >
              <div className='flex flex-col text-sm'>
                <span className='font-mono text-foreground'>{owner}</span>
                {hasDelegate ? (
                  <span className='text-muted-foreground'>
                    Delegated to <span className='font-mono'>{settings.delegate}</span>
                    {' — '}
                    {takeoverOpen
                      ? 'takeover available now'
                      : settings.lastAction === 0n
                        ? 'no activity recorded yet'
                        : `takeover possible after ${new Date(Number(takeoverAt) * 1000).toLocaleString()}`}
                  </span>
                ) : (
                  <span className='text-muted-foreground'>No delegatee set</span>
                )}
              </div>
              {isConnectedDelegate && takeoverOpen && (
                <TakeOverButton multiSigAddress={multiSigAddress} owner={owner as `0x${string}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className='flex flex-col gap-2'>
        <span className='text-sm font-semibold text-foreground'>Check a nonce</span>
        <div className='flex flex-wrap items-center gap-2'>
          <TextInput
            placeholder='Nonce number'
            value={nonceToCheck}
            onChange={(e) => setNonceToCheck(e.target.value)}
          />
          {/^\d+$/.test(nonceToCheck) && nonceUsed != null && (
            <span
              className={`text-sm font-semibold ${nonceUsed ? 'text-destructive' : 'text-primary'}`}
            >
              Nonce {nonceToCheck} is {nonceUsed ? 'used / burned' : 'available'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExtendedGovernancePanel
