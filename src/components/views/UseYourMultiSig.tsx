import React, { useState } from 'react'
import Link from 'next/link'
import { useAccount, useChainId, useChains } from 'wagmi'
import { SearchIcon } from 'lucide-react'
import { AddIcon, ImportIcon, DeleteIcon } from '../icons/ChakraIcons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TypedEyebrow, WordReveal } from '@/components/ui/reveal'
import { cn } from '@/lib/utils'
import ConnectWallet from './ConnectWallet'
import MultiSigRow from '../multiSigDetails/MultiSigRow'
import useHasMounted from '../../hooks/useHasMounted'
import useInbox from '../../hooks/useInbox'
import useNavigateOnChain from '../../hooks/useNavigateOnChain'
import useMultiSigs from '../../states/multiSigs'
import { walletHref } from '../shell/navigation'

type NetworkFilter = 'all' | 'current'

// Every multisig saved in this browser, on any network. Opening one on
// another network switches the app to it first.
const UseYourMultiSig: React.FC = () => {
  const hasMounted = useHasMounted()
  const { isConnected: walletConnected, address } = useAccount()
  // Wallet and saved-multisig state only exist in the browser: until mounted,
  // render the disconnected variant so the heading and copy are in the static HTML.
  const isConnected = hasMounted && walletConnected
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { multiSigs, clearAllMultiSig } = useMultiSigs()
  const { pendingByWallet } = useInbox()
  const navigate = useNavigateOnChain()
  const [filter, setFilter] = useState<NetworkFilter>('all')
  const [query, setQuery] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)

  const needle = query.trim().toLowerCase()
  const visible = multiSigs.filter(
    (m) =>
      (filter === 'all' || m.chainId === chainId) &&
      (needle === '' || `${m.name} ${m.address} ${m.chainName}`.toLowerCase().includes(needle))
  )
  const onCurrent = multiSigs.filter((m) => m.chainId === chainId).length
  const me = address?.toLowerCase()

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <TypedEyebrow text="YOUR MULTISIGS" className="mb-3" />
          <WordReveal
            text="Open a multisig"
            delay={0.2}
            className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          />
          {isConnected && (
            <p className="mt-2 text-sm text-muted-foreground">
              {multiSigs.length} saved in this browser, across every network.
            </p>
          )}
        </div>
        {isConnected && (
          <div className="flex flex-wrap gap-2">
            <Button asChild className="gap-2">
              <Link href="/create-multisig">
                <AddIcon className="h-4 w-4" />
                Create a multisig
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/import-multisig">
                <ImportIcon className="h-4 w-4" />
                Import a multisig
              </Link>
            </Button>
          </div>
        )}
      </header>

      {!isConnected || address === undefined ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Connect a wallet to see the multisigs saved in this browser and open them.
          </p>
          <ConnectWallet />
        </div>
      ) : multiSigs.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-border p-6 md:p-8">
          <div>
            <p className="text-base font-semibold text-foreground">No multisigs saved yet</p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Create a new one, or import one you already own. A multisig someone else created shows up here once you
              import it by address.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/create-multisig" className="gap-2">
                <AddIcon className="h-4 w-4" />
                Create a multisig
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/import-multisig" className="gap-2">
                <ImportIcon className="h-4 w-4" />
                Import a multisig
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Filter by network" className="flex gap-0.5 rounded-lg bg-muted p-0.5">
              {(
                [
                  { key: 'all', label: 'All networks', count: multiSigs.length },
                  { key: 'current', label: `${chain?.name ?? 'This network'} only`, count: onCurrent }
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.key}
                  onClick={() => setFilter(item.key)}
                  className={cn(
                    'flex min-h-8 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors',
                    filter === item.key
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                  <span className="font-mono text-xs font-normal">{item.count}</span>
                </button>
              ))}
            </div>
            <label className="flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-card px-3 text-sm">
              <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="sr-only">Search by name or address</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or address"
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden items-center gap-4 border-b border-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground lg:flex">
              <span className="w-9 shrink-0" />
              <span className="flex-1 basis-48">Name</span>
              <span className="w-32 shrink-0">Network</span>
              <span className="w-16 shrink-0">Quorum</span>
              <span className="w-24 shrink-0">Queue</span>
              <span className="w-28 shrink-0 text-right">Balance</span>
              <span className="w-4 shrink-0" />
            </div>
            {visible.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                No multisig matches. Try another name, or switch the filter to all networks.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {visible.map((multiSig) => (
                  <li key={`${multiSig.chainId}:${multiSig.address}`}>
                    <MultiSigRow
                      multiSig={multiSig}
                      pending={pendingByWallet[multiSig.address.toLowerCase()] ?? 0}
                      viewOnly={
                        me != null &&
                        multiSig.owners.length > 0 &&
                        !multiSig.owners.some((owner) => owner.toLowerCase() === me)
                      }
                      onOpen={() => navigate(walletHref(multiSig.address), multiSig.chainId)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div>
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmRemove(true)}
            >
              <DeleteIcon className="h-4 w-4" />
              Remove all from this browser
            </Button>
          </div>
        </>
      )}

      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle>Remove all multisigs from this browser?</DialogTitle>
            <DialogDescription>
              The wallets stay on-chain and keep their funds. You can import them again by address at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmRemove(false)}>
              Keep them
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAllMultiSig()
                setConfirmRemove(false)
              }}
            >
              Remove all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UseYourMultiSig
