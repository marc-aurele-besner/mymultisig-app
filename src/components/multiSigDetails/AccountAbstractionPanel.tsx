import React, { useState } from 'react'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'

import TextInput from '../inputs/TextInput'
import useAdvancedFeatures from '../../hooks/useAdvancedFeatures'
import useEntryPointDeposit from '../../hooks/useEntryPointDeposit'

interface AccountAbstractionPanelProps {
  multiSigAddress: `0x${string}`
}

const isUint = (value: string) => /^\d+$/.test(value)

// ERC-4337 surface of a 0.5.0 Extended wallet: it validates UserOperations
// against the pinned EntryPoint v0.7, so bundlers can execute owner-approved
// transactions and pay gas from the wallet's EntryPoint deposit. This panel
// shows the EntryPoint binding and lets anyone prefund the deposit.
const AccountAbstractionPanel: React.FC<AccountAbstractionPanelProps> = ({ multiSigAddress }) => {
  const { supportsAdvanced, entryPoint } = useAdvancedFeatures(multiSigAddress)
  const { depositBalance, deposit, isPending } = useEntryPointDeposit(entryPoint, multiSigAddress)
  const [amount, setAmount] = useState('')

  if (!supportsAdvanced || entryPoint == null) return null

  const ready = isUint(amount) && amount !== '' && BigInt(amount) > 0n

  return (
    <div className='flex w-full flex-col gap-3 rounded-lg border border-border p-4'>
      <div>
        <h3 className='text-xl font-bold text-foreground'>Account abstraction (ERC-4337)</h3>
        <p className='text-sm text-muted-foreground'>
          This wallet is a smart account: bundlers can submit owner-approved UserOperations through the EntryPoint, so
          no owner needs gas in their own wallet. Gas is drawn from the wallet&apos;s EntryPoint deposit (or a
          paymaster).
        </p>
      </div>
      <div className='flex flex-col gap-1 text-sm'>
        <span className='text-muted-foreground'>
          EntryPoint (v0.7): <span className='break-all font-mono text-foreground'>{entryPoint}</span>
        </span>
        <span className='text-muted-foreground'>
          Gas deposit:{' '}
          <span className='font-semibold text-foreground'>
            {depositBalance != null ? `${formatEther(depositBalance)} ETH` : '...'}
          </span>
        </span>
      </div>
      <div className='flex flex-wrap items-end gap-2'>
        <div className='flex flex-col gap-1.5'>
          <span className='text-sm font-semibold text-foreground'>Prefund deposit (wei)</span>
          <TextInput
            placeholder='e.g. 10000000000000000 (0.01 ETH)'
            value={amount}
            isInvalid={amount !== '' && !isUint(amount)}
            onChange={(e) => setAmount(e.target.value.trim())}
          />
        </div>
        <Button variant='outline' disabled={!ready || isPending} onClick={() => deposit(BigInt(amount))}>
          {isPending ? 'Confirm in your wallet...' : 'Deposit'}
        </Button>
      </div>
      <p className='text-xs text-muted-foreground'>
        UserOperations bind the wallet&apos;s current nonce and the same owner-signature threshold as a direct
        execution; the deposit only covers gas.
      </p>
    </div>
  )
}

export default AccountAbstractionPanel
