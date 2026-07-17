import React, { useEffect, useState } from 'react'
import { useChains } from 'wagmi'
import { LoadingDots } from '@/components/ui/loading-dots'
import { ExternalLinkIcon, LockIcon } from '../icons/ChakraIcons'

import BigCard from '../cards/BigCard'
import { listPublicAddressBook } from '../../utils'

interface PublicEntry {
  id: string
  ownerAddress: string
  chainId: number
  address: string
  label: string
  kind: string
}

// One row per shared (chain, address): every label users gave it plus how
// many distinct wallets share it — the signal for what to support officially.
interface SharedAddress {
  chainId: number
  address: string
  kind: string
  labels: string[]
  sharerCount: number
}

const groupEntries = (entries: PublicEntry[]): SharedAddress[] => {
  const groups = new Map<string, SharedAddress & { sharers: Set<string> }>()
  for (const entry of entries) {
    const key = `${entry.chainId}-${entry.address.toLowerCase()}`
    const group = groups.get(key) ?? {
      chainId: entry.chainId,
      address: entry.address,
      kind: entry.kind,
      labels: [],
      sharerCount: 0,
      sharers: new Set<string>()
    }
    if (!group.labels.includes(entry.label)) group.labels.push(entry.label)
    group.sharers.add(entry.ownerAddress.toLowerCase())
    if (entry.kind === 'contract') group.kind = 'contract'
    groups.set(key, group)
  }
  return Array.from(groups.values())
    .map(({ sharers, ...group }) => ({ ...group, sharerCount: sharers.size }))
    .sort((a, b) => b.sharerCount - a.sharerCount)
}

// Admin-only review of publicly shared address book entries. The API rejects
// wallets outside ADMIN_ADDRESSES, so this page degrades to an explanation
// for everyone else.
const PublicAddressBook: React.FC = () => {
  const chains = useChains()
  const [entries, setEntries] = useState<PublicEntry[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await listPublicAddressBook()
        if (response != null && Array.isArray(response.content)) {
          setEntries(response.content as PublicEntry[])
        } else {
          setDeniedMessage(typeof response?.message === 'string' ? response.message : 'Could not load entries.')
        }
      } catch {
        setDeniedMessage('Could not load entries.')
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  const shared = entries != null ? groupEntries(entries) : []

  return (
    <BigCard className='max-w-[1200px]'>
      <div className='flex w-full flex-col gap-6'>
        <div>
          <h2 className='font-display text-2xl font-bold tracking-tight text-foreground'>Public address book</h2>
          <p className='text-sm text-muted-foreground'>
            Addresses users chose to share publicly, grouped across chains. The more wallets share a contract, the
            stronger the case for supporting it officially.
          </p>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center p-6'>
            <LoadingDots label='Loading public entries...' />
          </div>
        ) : deniedMessage != null ? (
          <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4'>
            <LockIcon className='h-5 w-5 shrink-0 text-muted-foreground' />
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm font-semibold text-foreground'>Admins only</span>
              <span className='text-sm text-muted-foreground'>
                {deniedMessage.endsWith('.') ? deniedMessage : `${deniedMessage}.`} Sign in with a wallet listed in
                ADMIN_ADDRESSES to review shared entries.
              </span>
            </div>
          </div>
        ) : shared.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No public entries yet. Entries appear here once users mark address book items as public.
          </p>
        ) : (
          <div className='flex flex-col gap-2'>
            {shared.map((item) => {
              const chain = chains.find((c) => c.id === item.chainId)
              const explorerUrl = chain?.blockExplorers?.default?.url
              return (
                <div
                  key={`${item.chainId}-${item.address}`}
                  className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3'
                >
                  <div className='flex min-w-0 flex-col gap-0.5'>
                    <span className='text-sm font-semibold text-foreground'>{item.labels.join(' · ')}</span>
                    <span className='break-all font-mono text-xs text-muted-foreground'>{item.address}</span>
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    <span className='rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground'>
                      {chain?.name ?? `Chain ${item.chainId}`}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        item.kind === 'contract' ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary'
                      }`}
                    >
                      {item.kind === 'contract' ? 'Contract' : 'Wallet'}
                    </span>
                    <span className='rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary'>
                      shared by {item.sharerCount} {item.sharerCount === 1 ? 'user' : 'users'}
                    </span>
                    {explorerUrl != null && (
                      <a
                        href={`${explorerUrl}/address/${item.address}`}
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
              )
            })}
          </div>
        )}
      </div>
    </BigCard>
  )
}

export default PublicAddressBook
