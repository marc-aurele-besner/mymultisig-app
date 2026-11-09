import React from 'react'
import Link from 'next/link'
import { ChevronsUpDownIcon, DownloadIcon, LayoutGridIcon, PlusIcon, WalletIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import NetworkIcon from '../icons/NetworkIcon'
import useNavigateOnChain from '../../hooks/useNavigateOnChain'
import { MultiSig } from '../../models/MultiSigs'
import { walletHref } from './navigation'

export interface WalletSwitcherProps {
  wallet: MultiSig | null
  wallets: MultiSig[]
  pendingByWallet: Record<string, number>
  onNavigate?: () => void
}

// Sidebar control that names the wallet the navigation points at and lets
// the user jump to any other saved wallet, on any network. Opening a wallet
// on another network switches the app's network first, because wallet pages
// read the chain the app is on.
const WalletSwitcher: React.FC<WalletSwitcherProps> = ({ wallet, wallets, pendingByWallet, onNavigate }) => {
  const navigate = useNavigateOnChain()

  const open = (target: MultiSig) => {
    onNavigate?.()
    navigate(walletHref(target.address), target.chainId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          aria-label='Switch multisig'
          className='flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/40'
        >
          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
            {wallet != null ? (
              <NetworkIcon chainId={wallet.chainId} name={wallet.chainName} size={18} />
            ) : (
              <WalletIcon className='h-4 w-4' />
            )}
          </span>
          <span className='flex min-w-0 flex-1 flex-col'>
            <span className='truncate text-sm font-semibold text-foreground'>
              {wallet != null ? wallet.name || 'Multisig' : 'No multisig yet'}
            </span>
            <span className='truncate text-xs text-muted-foreground'>
              {wallet != null
                ? `${wallet.threshold} of ${wallet.ownerCount} · ${wallet.chainName}`
                : 'Create or import one'}
            </span>
          </span>
          <ChevronsUpDownIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-[--radix-dropdown-menu-trigger-width] min-w-[250px]'>
        <DropdownMenuLabel className='font-mono text-[11px] font-normal uppercase tracking-wider text-muted-foreground'>
          Your multisigs · all networks
        </DropdownMenuLabel>
        {wallets.length === 0 && (
          <p className='px-2 py-1.5 text-sm text-muted-foreground'>Nothing saved in this browser yet.</p>
        )}
        {wallets.map((item) => {
          const pending = pendingByWallet[item.address.toLowerCase()] ?? 0
          return (
            <DropdownMenuItem
              key={`${item.chainId}:${item.address}`}
              onClick={() => open(item)}
              className='gap-2'
            >
              <NetworkIcon chainId={item.chainId} name={item.chainName} size={16} />
              <span className='min-w-0 flex-1 truncate'>{item.name || 'Multisig'}</span>
              {pending > 0 && (
                <span className='rounded-full bg-primary px-1.5 font-mono text-[10px] font-semibold text-primary-foreground'>
                  {pending}
                </span>
              )}
              <span className='text-xs text-muted-foreground'>{item.chainName}</span>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/create-multisig' onClick={onNavigate} className='gap-2'>
            <PlusIcon className='h-4 w-4' />
            Create a multisig
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/import-multisig' onClick={onNavigate} className='gap-2'>
            <DownloadIcon className='h-4 w-4' />
            Import a multisig
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/open-multisig' onClick={onNavigate} className='gap-2'>
            <LayoutGridIcon className='h-4 w-4' />
            All multisigs
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WalletSwitcher
