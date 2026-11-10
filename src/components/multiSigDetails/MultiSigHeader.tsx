import React, { useState } from 'react'
import Link from 'next/link'
import { useAccount, useChainId, useChains } from 'wagmi'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyIcon, CheckIcon, ExternalLinkIcon, CoinsIcon } from '../icons/ChakraIcons'

import NetworkIcon from '../icons/NetworkIcon'
import FundMultiSigModal from '../modals/FundMultiSigModal'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import useMultiSigs from '../../states/multiSigs'
import truncateAddress from '../../utils/truncateAddress'
import { walletHref } from '../shell/navigation'

interface MultiSigHeaderProps {
  multiSigAddress: `0x${string}`
}

const Pill: React.FC<{ children: React.ReactNode; accent?: boolean }> = ({ children, accent }) => (
  <span
    className={
      accent
        ? 'rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[11px] text-primary'
        : 'rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground'
    }
  >
    {children}
  </span>
)

// Wallet identity block on every /multisig/[address] subpage and request
// page: name, type, version and quorum, the address with copy + explorer
// shortcuts, and the two actions people come here for.
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
  const version = multiSigDetails?.version ?? stored?.version
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
    <div className='flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3'>
      <div className='flex min-w-0 flex-1 basis-72 items-center gap-3'>
        {chain && (
          <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted' title={chain.name}>
            <NetworkIcon chainId={chain.id} name={chain.name} size={22} />
          </span>
        )}
        <div className='flex min-w-0 flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='truncate font-display text-xl font-bold tracking-tight text-foreground md:text-2xl'>
              {name}
            </h1>
            {walletType != null && <Pill accent>{walletType === 'extended' ? 'Extended' : 'Simple'}</Pill>}
            {version != null && version !== '' && <Pill>v{version}</Pill>}
            {multiSigDetails != null && (
              <Pill>
                {multiSigDetails.threshold} of {multiSigDetails.ownerCount}
              </Pill>
            )}
          </div>
          <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
            <span className='hidden break-all font-mono text-xs md:inline'>{multiSigAddress}</span>
            <span className='font-mono text-xs md:hidden'>{truncateAddress(multiSigAddress)}</span>
            <button
              type='button'
              onClick={handleCopy}
              aria-label='Copy address'
              className='text-muted-foreground transition-colors hover:text-primary'
            >
              {copied ? (
                <CheckIcon className='h-3.5 w-3.5 animate-pop-in text-primary' />
              ) : (
                <CopyIcon className='h-3.5 w-3.5' />
              )}
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
            {chain && <span className='text-xs'>{chain.name}</span>}
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' className='gap-2' onClick={() => setFundModalOpen(true)}>
          <CoinsIcon className='h-4 w-4' />
          Fund wallet
        </Button>
        {/* On small screens "New" is in the bottom tab bar */}
        <Button asChild className='hidden gap-2 lg:inline-flex'>
          <Link href={walletHref(multiSigAddress, 'buildRequest')}>
            <PlusIcon className='h-4 w-4' />
            New request
          </Link>
        </Button>
      </div>
      <FundMultiSigModal multiSigAddress={multiSigAddress} open={fundModalOpen} onOpenChange={setFundModalOpen} />
    </div>
  )
}

export default MultiSigHeader
