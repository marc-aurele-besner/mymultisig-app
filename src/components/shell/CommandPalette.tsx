import React from 'react'
import { ListIcon, WalletIcon } from 'lucide-react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import useActiveWallet from '../../hooks/useActiveWallet'
import useInbox from '../../hooks/useInbox'
import useNavigateOnChain from '../../hooks/useNavigateOnChain'
import { EXPLORE_NAV, WALLET_SECTIONS, WORKSPACE_NAV, walletHref } from './navigation'

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_HINT = { sign: 'needs your signature', execute: 'ready to execute', waiting: 'waiting on others' } as const

// Search-and-jump for everything the sidebar reaches, plus every saved
// multisig and open request. Opened with Cmd/Ctrl+K or the top bar button.
const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigateOnChain()
  const { wallet, wallets } = useActiveWallet()
  const { items } = useInbox()

  const go = (href: string, targetChainId?: number) => {
    onOpenChange(false)
    navigate(href, targetChainId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} aria-describedby={undefined} className='top-[20%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0'>
        <DialogTitle className='sr-only'>Search and jump</DialogTitle>
        <Command>
          <CommandInput placeholder='Search multisigs, requests, pages…' />
          <CommandList className='max-h-[360px]'>
            <CommandEmpty>Nothing matches.</CommandEmpty>
            {wallets.length > 0 && (
              <CommandGroup heading='MULTISIGS'>
                {wallets.map((item) => (
                  <CommandItem
                    key={`${item.chainId}:${item.address}`}
                    value={`${item.name} ${item.address} ${item.chainName}`}
                    onSelect={() => go(walletHref(item.address), item.chainId)}
                  >
                    <WalletIcon className='h-4 w-4 text-muted-foreground' />
                    <span className='min-w-0 flex-1 truncate'>{item.name || 'Multisig'}</span>
                    <span className='text-xs text-muted-foreground'>{item.chainName}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {items.length > 0 && (
              <CommandGroup heading='OPEN REQUESTS'>
                {items.map(({ request, wallet: owner, status }) => (
                  <CommandItem
                    key={request.id}
                    value={`${request.description} ${owner.name} ${request.id}`}
                    onSelect={() => go(`/request/${request.id}`, owner.chainId)}
                  >
                    <ListIcon className='h-4 w-4 text-muted-foreground' />
                    <span className='min-w-0 flex-1 truncate'>{request.description}</span>
                    <span className='text-xs text-muted-foreground'>{STATUS_HINT[status]}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {wallet != null && (
              <CommandGroup heading={(wallet.name || 'MULTISIG').toUpperCase()}>
                {WALLET_SECTIONS.map((section) => (
                  <CommandItem
                    key={section.slug}
                    value={`${wallet.name} ${section.label} ${section.short}`}
                    onSelect={() => go(walletHref(wallet.address, section.slug), wallet.chainId)}
                  >
                    <section.icon className='h-4 w-4 text-muted-foreground' />
                    {section.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading='GO TO'>
              {[...WORKSPACE_NAV, ...EXPLORE_NAV].map((item) => (
                <CommandItem key={item.href} value={item.label} onSelect={() => go(item.href)}>
                  <item.icon className='h-4 w-4 text-muted-foreground' />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export default CommandPalette
