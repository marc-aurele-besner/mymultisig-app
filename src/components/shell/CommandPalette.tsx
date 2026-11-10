import React, { useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId, useDisconnect, useSwitchChain } from 'wagmi'
import { useTheme } from 'next-themes'
import { ListIcon, LogOutIcon, SunMoonIcon, WalletIcon, type LucideIcon } from 'lucide-react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import NetworkIcon from '../icons/NetworkIcon'
import useActiveWallet from '../../hooks/useActiveWallet'
import useInbox from '../../hooks/useInbox'
import useNavigateOnChain from '../../hooks/useNavigateOnChain'
import useConnectModal from '../../states/connectModal'
import { getNetworkStatus } from '../../constants/networkStatus'
import truncateAddress from '../../utils/truncateAddress'
import { WALLET_SECTIONS, walletHref } from './navigation'
import { SEARCH_INDEX } from './searchIndex'
import { rank, type Searchable } from './searchRank'

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PaletteEntry extends Searchable {
  id: string
  group: string
  icon: React.ReactNode
  onSelect: () => void
}

const STATUS_HINT = { sign: 'needs your signature', execute: 'ready to execute', waiting: 'waiting on others' } as const

// Words for a wallet section that are not in its label.
const SECTION_KEYWORDS: Record<string, string[]> = {
  '': ['overview', 'summary', 'balance', 'owners', 'home'],
  requests: ['queue', 'requests', 'pending', 'transactions', 'sign', 'execute', 'history'],
  buildRequest: ['new request', 'propose', 'send', 'transfer', 'pay', 'build', 'transaction', 'batch', 'contract call'],
  assets: ['tokens', 'balance', 'erc20', 'nfts', 'funds', 'coins'],
  activity: ['history', 'events', 'log', 'executed', 'received'],
  addressBook: ['contacts', 'labels', 'addresses', 'names'],
  settings: ['owners', 'threshold', 'add owner', 'remove owner', 'rpc', 'timelock', 'allowance', 'modules', 'admin']
}

const lucide = (Icon: LucideIcon) => <Icon className='h-4 w-4' />

const Row: React.FC<{ entry: PaletteEntry; showGroup?: boolean }> = ({ entry, showGroup }) => (
  <>
    <span className='grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground'>
      {entry.icon}
    </span>
    <span className='flex min-w-0 flex-1 flex-col'>
      <span className='truncate text-sm text-foreground'>{entry.label}</span>
      {entry.hint != null && <span className='truncate text-xs text-muted-foreground'>{entry.hint}</span>}
    </span>
    {showGroup && (
      <span className='shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70'>
        {entry.group}
      </span>
    )}
  </>
)

// Search-and-jump for the whole app. Static pages come from SEARCH_INDEX
// (with synonyms); the palette adds saved multisigs, open requests, the
// active wallet's sections, networks to switch to, and a few actions.
// With an empty box it lists everything by group; once you type, results
// are one list ranked by searchRank (name matches first, then synonyms,
// one typo forgiven). Opened with Cmd/Ctrl+K or the top bar button.
const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigateOnChain()
  const chainId = useChainId()
  const { chains, switchChain } = useSwitchChain()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { resolvedTheme, setTheme } = useTheme()
  const openConnect = useConnectModal((state) => state.setOpen)
  const { wallet, wallets } = useActiveWallet()
  const { items } = useInbox()
  const [query, setQuery] = useState('')
  // Highlighted row. Controlled so the top result is always the one Enter
  // opens after the list changes under the cursor.
  const [selected, setSelected] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const entries = useMemo<PaletteEntry[]>(() => {
    const close = () => onOpenChange(false)
    const go = (href: string, targetChainId?: number) => () => {
      close()
      navigate(href, targetChainId)
    }
    const run = (action: () => void) => () => {
      close()
      action()
    }
    const list: PaletteEntry[] = []

    for (const item of wallets) {
      list.push({
        id: `wallet:${item.chainId}:${item.address}`.toLowerCase(),
        group: 'Multisigs',
        label: item.name || 'Multisig',
        hint: `${truncateAddress(item.address)} · ${item.threshold} of ${item.ownerCount} · ${item.chainName}`,
        keywords: [item.address, item.chainName, 'multisig', 'wallet'],
        icon: lucide(WalletIcon),
        onSelect: go(walletHref(item.address), item.chainId)
      })
    }
    for (const { request, wallet: owner, status } of items) {
      list.push({
        id: `request:${request.id}`,
        group: 'Open requests',
        label: request.description,
        hint: `${owner.name || 'Multisig'} · ${STATUS_HINT[status]}`,
        keywords: [owner.name, request.id, 'request', 'queue', 'pending', STATUS_HINT[status]],
        icon: lucide(ListIcon),
        onSelect: go(`/request/${request.id}`, owner.chainId)
      })
    }
    if (wallet != null) {
      for (const section of WALLET_SECTIONS) {
        list.push({
          id: `section:${section.slug}`,
          group: wallet.name || 'Multisig',
          label: section.label,
          hint: `In ${wallet.name || 'this multisig'}`,
          keywords: [section.short, ...SECTION_KEYWORDS[section.slug]],
          icon: lucide(section.icon),
          onSelect: go(walletHref(wallet.address, section.slug), wallet.chainId)
        })
      }
    }
    for (const entry of SEARCH_INDEX) {
      list.push({
        id: `page:${entry.href}`,
        group: entry.group,
        label: entry.label,
        hint: entry.hint,
        keywords: entry.keywords,
        icon: lucide(entry.icon),
        onSelect: go(entry.href)
      })
    }
    // Only networks with a factory can be switched to; the rest are found
    // through the "Supported networks" page entry.
    for (const chain of chains) {
      if (chain.id === chainId || getNetworkStatus(chain.id) !== 'active') continue
      list.push({
        id: `chain:${chain.id}`,
        group: 'Switch network',
        label: `Switch to ${chain.name}`,
        hint: `Chain ${chain.id}`,
        keywords: [chain.name, String(chain.id), 'network', 'chain', chain.testnet ? 'testnet' : 'mainnet'],
        icon: <NetworkIcon chainId={chain.id} name={chain.name} size={16} />,
        onSelect: run(() => switchChain({ chainId: chain.id }))
      })
    }
    const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    list.push({
      id: 'action:theme',
      group: 'Actions',
      label: `Switch to ${nextTheme} theme`,
      keywords: ['theme', 'dark', 'light', 'mode', 'appearance', 'color', 'toggle'],
      icon: lucide(SunMoonIcon),
      onSelect: run(() => setTheme(nextTheme))
    })
    list.push(
      isConnected
        ? {
            id: 'action:disconnect',
            group: 'Actions',
            label: 'Disconnect wallet',
            keywords: ['log out', 'sign out', 'logout'],
            icon: lucide(LogOutIcon),
            onSelect: run(() => disconnect())
          }
        : {
            id: 'action:connect',
            group: 'Actions',
            label: 'Connect a wallet',
            keywords: ['log in', 'sign in', 'login', 'metamask', 'coinbase', 'walletconnect'],
            icon: lucide(WalletIcon),
            onSelect: run(() => openConnect(true))
          }
    )
    // cmdk compares item values case-insensitively in places; keep ids lowercase.
    return list.map((entry) => ({ ...entry, id: entry.id.toLowerCase() }))
  }, [
    wallets,
    items,
    wallet,
    chains,
    chainId,
    resolvedTheme,
    isConnected,
    navigate,
    onOpenChange,
    switchChain,
    setTheme,
    disconnect,
    openConnect
  ])

  const searching = query.trim() !== ''
  const results = useMemo(() => (searching ? rank(query, entries) : []), [searching, query, entries])
  const groups = useMemo(() => [...new Set(entries.map((entry) => entry.group))], [entries])

  const firstId = searching ? results[0]?.id : entries[0]?.id
  useEffect(() => {
    setSelected(firstId ?? '')
  }, [firstId, query, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        aria-describedby={undefined}
        className='top-[15%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0'
      >
        <DialogTitle className='sr-only'>Search and jump</DialogTitle>
        {/* Ranking is done here, not by cmdk: its fuzzy match is too loose for short queries */}
        <Command shouldFilter={false} value={selected} onValueChange={setSelected}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder='Search pages, settings, guides, multisigs, requests…'
          />
          <CommandList className='max-h-[420px]'>
            {searching ? (
              <>
                <CommandEmpty>
                  Nothing matches “{query.trim()}”. Try a page name, a feature (“slack”, “api key”, “rpc”) or a
                  multisig name.
                </CommandEmpty>
                {results.length > 0 && (
                  <CommandGroup heading='RESULTS'>
                    {results.map((entry) => (
                      <CommandItem key={entry.id} value={entry.id} onSelect={entry.onSelect}>
                        <Row entry={entry} showGroup />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            ) : (
              groups.map((group) => (
                <CommandGroup key={group} heading={group.toUpperCase()}>
                  {entries
                    .filter((entry) => entry.group === group)
                    .map((entry) => (
                      <CommandItem key={entry.id} value={entry.id} onSelect={entry.onSelect}>
                        <Row entry={entry} />
                      </CommandItem>
                    ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export default CommandPalette
