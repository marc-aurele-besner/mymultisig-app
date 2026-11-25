import React, { useState } from 'react'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'

import TextInput from '../inputs/TextInput'
import AddressBookInput from '../inputs/AddressBookInput'
import useSpendingAllowance from '../../hooks/useSpendingAllowance'
import { hasUnrestrictedAllowance } from '../../utils/contractVersions'

interface SpendingAllowancePanelProps {
  multiSigAddress: `0x${string}`
}

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const isUint = (value: string) => /^\d+$/.test(value)

const DEFAULT_ALLOWANCE_GAS = '50000'

// 0.5.0 contracts only charge `value` against the cap and let `data` through,
// so a cap of even 1 wei lets its owner transfer or approve every token and
// NFT, or call modules, alone. This panel itself only ever sends data '0x'.
const UnrestrictedAllowanceWarning: React.FC<{ hasCap: boolean }> = ({ hasCap }) => (
  <div role='alert' className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive'>
    <p className='font-semibold'>Spending allowances are unsafe on this wallet version (0.5.0)</p>
    <p className='mt-1'>
      The daily cap only limits the native amount. An owner with any cap, even 1 wei, can move every token and NFT the
      wallet holds, approve spenders, or call any contract with only their own signature.{' '}
      {hasCap
        ? 'Ask your co-owners to set your daily spending limit back to 0 (Owners & administration → Spending allowances).'
        : 'Do not grant a daily spending limit to any owner on this wallet; if one was granted, set it back to 0.'}
    </p>
  </div>
)

// Single-signer spending against the connected owner's daily allowance
// (0.5.0 Extended wallets). Renders only when the connected account has a
// non-zero cap; granting caps happens through the admin actions. On wallets
// reporting version 0.5.0 the contract does not restrict the call data of
// this path, so it also warns every owner to keep caps at 0 there.
const SpendingAllowancePanel: React.FC<SpendingAllowancePanelProps> = ({ multiSigAddress }) => {
  const { dailyLimit, remaining, walletVersion, spend, isPending, isSuccess, reset } =
    useSpendingAllowance(multiSigAddress)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const unrestricted = hasUnrestrictedAllowance(walletVersion)
  const hasCap = dailyLimit != null && dailyLimit > 0n

  if (!hasCap) return unrestricted ? <UnrestrictedAllowanceWarning hasCap={false} /> : null

  const ready = isAddress(to) && isUint(amount) && amount !== '' && BigInt(amount) > 0n
  const overRemaining = ready && remaining != null && BigInt(amount) > remaining

  return (
    <div className='flex w-full flex-col gap-3 rounded-lg border border-border p-4'>
      <div>
        <h3 className='text-xl font-bold text-foreground'>Your daily spending allowance</h3>
        <p className='text-sm text-muted-foreground'>
          You can send up to {formatEther(dailyLimit)} ETH per rolling 24h window with only your own signature — no
          other owners needed. Remaining right now:{' '}
          <span className='font-semibold text-foreground'>
            {remaining != null ? `${formatEther(remaining)} ETH` : '...'}
          </span>
          .
        </p>
      </div>
      {unrestricted && <UnrestrictedAllowanceWarning hasCap />}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <span className='text-sm font-semibold text-foreground'>Send to</span>
          <AddressBookInput placeholder='Recipient (0x...)' value={to} allowSave onChange={setTo} />
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-sm font-semibold text-foreground'>Amount (wei)</span>
          <TextInput
            className='md:w-full'
            placeholder='e.g. 100000000000000000 (0.1 ETH)'
            value={amount}
            isInvalid={amount !== '' && !isUint(amount)}
            onChange={(e) => setAmount(e.target.value.trim())}
          />
        </div>
      </div>
      {overRemaining && (
        <p className='text-sm text-destructive'>
          That exceeds what remains of today&apos;s allowance ({remaining != null ? formatEther(remaining) : '0'} ETH).
        </p>
      )}
      <div className='flex items-center gap-2'>
        <Button
          disabled={!ready || overRemaining || isPending || isSuccess}
          onClick={() => spend(to as `0x${string}`, amount, DEFAULT_ALLOWANCE_GAS)}
        >
          {isSuccess ? 'Sent' : isPending ? 'Confirm in your wallet...' : 'Send with my allowance'}
        </Button>
        {isSuccess && (
          <Button variant='outline' onClick={() => reset()}>
            Send another
          </Button>
        )}
      </div>
    </div>
  )
}

export default SpendingAllowancePanel
