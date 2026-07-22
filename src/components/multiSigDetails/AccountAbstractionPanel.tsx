import React, { useState } from 'react'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'

import TextInput from '../inputs/TextInput'
import AddressBookInput from '../inputs/AddressBookInput'
import useAdvancedFeatures from '../../hooks/useAdvancedFeatures'
import useEntryPointDeposit from '../../hooks/useEntryPointDeposit'
import useEntryPointNonce from '../../hooks/useEntryPointNonce'
import useBundlerConfig from '../../states/bundlerConfig'
import { useChainId } from 'wagmi'

interface AccountAbstractionPanelProps {
  multiSigAddress: `0x${string}`
}

const isUint = (value: string) => /^\d+$/.test(value)
const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

// ERC-4337 surface of a 0.5.0 Extended wallet: it validates UserOperations
// against the pinned EntryPoint v0.7, so bundlers can execute owner-approved
// transactions and pay gas from the wallet's EntryPoint deposit (or a
// paymaster). This panel shows the EntryPoint binding, lets anyone prefund
// the deposit, lets the owner withdraw it, and surfaces the bundler /
// paymaster URLs the request builder uses.
const AccountAbstractionPanel: React.FC<AccountAbstractionPanelProps> = ({ multiSigAddress }) => {
  const chainId = useChainId()
  const { supportsAdvanced, entryPoint } = useAdvancedFeatures(multiSigAddress)
  const { depositBalance, deposit, withdraw, isPending } = useEntryPointDeposit(entryPoint, multiSigAddress)
  const { nonce: entryPointNonce } = useEntryPointNonce(entryPoint, multiSigAddress)
  const { perChain, setConfig } = useBundlerConfig()
  const config = chainId != null ? (perChain[chainId] ?? {}) : {}

  const [amount, setAmount] = useState('')
  const [withdrawRecipient, setWithdrawRecipient] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bundlerUrl, setBundlerUrl] = useState(config.bundlerUrl ?? '')
  const [paymasterUrl, setPaymasterUrl] = useState(config.paymasterUrl ?? '')

  if (!supportsAdvanced || entryPoint == null) return null

  const ready = isUint(amount) && amount !== '' && BigInt(amount) > 0n
  const withdrawReady = isAddress(withdrawRecipient) && isUint(withdrawAmount) && BigInt(withdrawAmount) > 0n
  const saveBundlerUrl = (value: string) => {
    setBundlerUrl(value)
    if (chainId != null) setConfig(chainId, { bundlerUrl: value === '' ? undefined : value })
  }
  const savePaymasterUrl = (value: string) => {
    setPaymasterUrl(value)
    if (chainId != null) setConfig(chainId, { paymasterUrl: value === '' ? undefined : value })
  }

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
        <span className='text-muted-foreground'>
          EntryPoint nonce:{' '}
          <span className='font-mono text-foreground'>
            {entryPointNonce != null ? entryPointNonce.toString() : '...'}
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
      <div className='flex flex-wrap items-end gap-2'>
        <div className='flex flex-1 flex-col gap-1.5'>
          <span className='text-sm font-semibold text-foreground'>Withdraw to (recipient)</span>
          <AddressBookInput
            placeholder='0x...'
            value={withdrawRecipient}
            isInvalid={withdrawRecipient !== '' && !isAddress(withdrawRecipient)}
            onChange={setWithdrawRecipient}
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-sm font-semibold text-foreground'>Amount (wei)</span>
          <TextInput
            placeholder='0'
            value={withdrawAmount}
            isInvalid={withdrawAmount !== '' && !isUint(withdrawAmount)}
            onChange={(e) => setWithdrawAmount(e.target.value.trim())}
          />
        </div>
        <Button
          variant='outline'
          disabled={!withdrawReady || isPending}
          onClick={() => withdraw(withdrawRecipient as `0x${string}`, BigInt(withdrawAmount))}
        >
          Withdraw
        </Button>
      </div>
      <div className='flex flex-col gap-2 rounded-lg border border-border p-3'>
        <span className='text-sm font-semibold text-foreground'>Bundler + paymaster (per chain)</span>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs text-muted-foreground'>Bundler URL (JSON-RPC; eth_sendUserOperation)</span>
          <TextInput
            placeholder='https://api.pimlico.io/v2/<chain>/rpc'
            value={bundlerUrl}
            onChange={(e) => saveBundlerUrl(e.target.value.trim())}
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs text-muted-foreground'>Paymaster URL (optional; pm_getPaymasterData)</span>
          <TextInput
            placeholder='https://api.pimlico.io/v2/<chain>/rpc'
            value={paymasterUrl}
            onChange={(e) => savePaymasterUrl(e.target.value.trim())}
          />
        </div>
        <p className='text-xs text-muted-foreground'>
          Configured URLs are saved per chain in your browser. Leave blank to use the NEXT_PUBLIC_BUNDLER_URL /
          NEXT_PUBLIC_PAYMASTER_URL env vars when available.
        </p>
      </div>
      <p className='text-xs text-muted-foreground'>
        UserOperations use the EntryPoint&apos;s 2D nonce (independent of the wallet&apos;s own transaction nonce) and
        the same owner-signature threshold as a direct execution. Owners sign the EntryPoint userOpHash via
        personal_sign; the wallet&apos;s `userOpSigningHash` is the EIP-191 wrap of that digest.
      </p>
    </div>
  )
}

export default AccountAbstractionPanel
