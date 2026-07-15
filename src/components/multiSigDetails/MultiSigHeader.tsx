import React, { useState } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'
import { Button } from '@/components/ui/button'
import { CopyIcon, CheckIcon, ExternalLinkIcon, CoinsIcon } from '../icons/ChakraIcons'

import NetworkIcon from '../icons/NetworkIcon'
import FundMultiSigModal from '../modals/FundMultiSigModal'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigHeaderProps {
  multiSigAddress: `0x${string}`
}

// Wallet identity block shown above the tab navigation on every
// /multisig/[address] subpage: name, type badge, network, and the address
// with copy + explorer shortcuts.
const MultiSigHeader: React.FC<MultiSigHeaderProps> = ({ multiSigAddress }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address } = useAccount()
  const { multiSigDetails } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { walletType } = useWalletType(multiSigAddress)
  const { multiSigs } = useMultiSigs()
  const [copied, setCopied] = useState(false)
  const [fundModalOpen, setFundModalOpen] = useState(false)

  const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
  const name = multiSigDetails?.name ?? stored?.name ?? 'Multisig'
  const explorerUrl = chain?.blockExplorers?.default?.url

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(multiSigAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied; nothing actionable.
    }
  }

  return (
    <div className='flex w-full flex-wrap items-start justify-between gap-3'>
      <div className='flex min-w-0 flex-col gap-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='truncate text-2xl font-bold text-foreground md:text-3xl'>{name}</h1>
          {walletType != null && (
            <span className='rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary'>
              {walletType === 'extended' ? 'Extended' : 'Simple'}
            </span>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
          <span className='break-all font-mono text-xs'>{multiSigAddress}</span>
          <button
            type='button'
            onClick={handleCopy}
            aria-label='Copy address'
            className='text-muted-foreground transition-colors hover:text-primary'
          >
            {copied ? <CheckIcon className='h-3.5 w-3.5 animate-pop-in text-primary' /> : <CopyIcon className='h-3.5 w-3.5' />}
          </button>
          {explorerUrl && (
            <a
              href={`${explorerUrl}/address/${multiSigAddress}`}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='View on explorer'
              className='text-muted-foreground transition-colors hover:text-primary'
            >
              <ExternalLinkIcon className='h-3.5 w-3.5' />
            </a>
          )}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        {chain && (
          <span className='flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground'>
            <NetworkIcon chainId={chain.id} name={chain.name} size={16} />
            {chain.name}
          </span>
        )}
        <Button className='gap-2' onClick={() => setFundModalOpen(true)}>
          <CoinsIcon className='h-4 w-4' />
          Fund wallet
        </Button>
      </div>
      <FundMultiSigModal multiSigAddress={multiSigAddress} open={fundModalOpen} onOpenChange={setFundModalOpen} />
    </div>
  )
}

export default MultiSigHeader
