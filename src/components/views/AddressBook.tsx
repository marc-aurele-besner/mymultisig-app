import React, { useState } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AddIcon, DeleteIcon, CheckIcon, ExternalLinkIcon, LockIcon, ViewIcon } from '../icons/ChakraIcons'

import Identicon from '../common/Identicon'
import SectionCard from '../common/SectionCard'
import TextInput from '../inputs/TextInput'
import useAddressBook, { AddressBookEntry, AddressBookEntryKind } from '../../states/addressBook'
import useContracts from '../../states/contracts'
import useMultiSigs from '../../states/multiSigs'
import { persistAddressBookUpsert, persistAddressBookRemoval } from '../../utils/addressBookSync'
import truncateAddress from '../../utils/truncateAddress'

interface AddressBookProps {
  multiSigAddress: `0x${string}`
}

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

const KIND_BADGE: Record<AddressBookEntryKind, string> = {
  wallet: 'bg-primary/15 text-primary',
  contract: 'bg-muted text-muted-foreground'
}

const EntryRow: React.FC<{ entry: AddressBookEntry; explorerUrl?: string; ownerAddress?: string }> = ({
  entry,
  explorerUrl,
  ownerAddress
}) => {
  const { updateEntry, removeEntry } = useAddressBook()
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(entry.label)

  const saveLabel = () => {
    if (label.trim() !== '') {
      updateEntry(entry.id, { label: label.trim() })
      persistAddressBookUpsert(
        { chainId: entry.chainId, address: entry.address, label: label.trim(), kind: entry.kind, isPublic: entry.isPublic },
        ownerAddress
      )
    }
    setEditing(false)
  }

  const toggleVisibility = () => {
    const isPublic = entry.isPublic !== true
    updateEntry(entry.id, { isPublic })
    persistAddressBookUpsert(
      { chainId: entry.chainId, address: entry.address, label: entry.label, kind: entry.kind, isPublic },
      ownerAddress
    )
  }

  const handleRemove = () => {
    removeEntry(entry.id)
    persistAddressBookRemoval(entry, ownerAddress)
  }

  return (
    <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-3'>
      <Identicon value={entry.address} size={28} />
      <div className='flex min-w-0 flex-1 basis-40 flex-col gap-0.5'>
        {editing ? (
          <div className='flex items-center gap-2'>
            <TextInput
              className='h-auto w-56 py-1.5 md:w-56'
              placeholder='Label'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveLabel()}
            />
            <Button size='sm' variant='outline' className='gap-1' onClick={saveLabel}>
              <CheckIcon className='h-3.5 w-3.5' />
              Save
            </Button>
          </div>
        ) : (
          <button
            type='button'
            onClick={() => setEditing(true)}
            className='w-max text-left text-sm font-semibold text-foreground transition-colors hover:text-primary'
            title='Click to rename'
          >
            {entry.label}
          </button>
        )}
        <span className='font-mono text-xs text-muted-foreground' title={entry.address}>
          {truncateAddress(entry.address)}
        </span>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${KIND_BADGE[entry.kind]}`}>
          {entry.kind === 'contract' ? 'Contract' : 'Wallet'}
        </span>
        <button
          type='button'
          onClick={toggleVisibility}
          title={
            entry.isPublic === true
              ? 'Public: the MyMultiSig team can see this entry. Click to make it private.'
              : 'Private: only you can see this entry. Click to share it publicly.'
          }
          className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold transition-colors ${
            entry.isPublic === true
              ? 'bg-primary/15 text-primary hover:bg-primary/25'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {entry.isPublic === true ? <ViewIcon className='h-3 w-3' /> : <LockIcon className='h-3 w-3' />}
          {entry.isPublic === true ? 'Public' : 'Private'}
        </button>
        {explorerUrl && (
          <a
            href={`${explorerUrl}/address/${entry.address}`}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='View on explorer'
            className='text-muted-foreground transition-colors hover:text-primary'
          >
            <ExternalLinkIcon className='h-3.5 w-3.5' />
          </a>
        )}
        <Button
          variant='ghost'
          size='icon'
          aria-label='Remove entry'
          className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          onClick={handleRemove}
        >
          <DeleteIcon className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

// Browser-local address book: label wallets and contracts once, see the labels
// everywhere addresses are rendered (request builder, activity, owners).
const AddressBook: React.FC<AddressBookProps> = ({ multiSigAddress }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { address: connectedAddress } = useAccount()
  const { entries, addEntry } = useAddressBook()
  const contracts = useContracts((state) => state.contracts)
  const { multiSigs } = useMultiSigs()

  const [newAddress, setNewAddress] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newKind, setNewKind] = useState<AddressBookEntryKind>('wallet')
  const [newIsPublic, setNewIsPublic] = useState(false)
  const [search, setSearch] = useState('')

  const chainEntries = chain != null ? entries.filter((e) => e.chainId === chain.id) : []
  const known = (address: string) => chainEntries.some((e) => e.address.toLowerCase() === address.toLowerCase())

  const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())

  // One-click suggestions from what the app already knows about: this wallet,
  // its owners, and contracts saved for the call builder.
  const suggestions: { address: `0x${string}`; label: string; kind: AddressBookEntryKind }[] = []
  if (!known(multiSigAddress))
    suggestions.push({ address: multiSigAddress, label: stored?.name ?? 'This multisig', kind: 'contract' })
  ;(stored?.owners ?? []).forEach((owner, index) => {
    if (!known(owner))
      suggestions.push({
        address: owner as `0x${string}`,
        label:
          connectedAddress != null && owner.toLowerCase() === connectedAddress.toLowerCase()
            ? 'Me'
            : `Owner ${index + 1}`,
        kind: 'wallet'
      })
  })
  contracts
    .filter((c) => !c.isMultiSig && isAddress(c.address) && c.chainId === chain?.id && !known(c.address))
    .forEach((c) => suggestions.push({ address: c.address as `0x${string}`, label: c.name, kind: 'contract' }))

  const duplicate = isAddress(newAddress) && known(newAddress)
  const canAdd = chain != null && isAddress(newAddress) && newLabel.trim() !== '' && !duplicate

  const handleAdd = () => {
    if (!canAdd || chain == null) return
    const entry = {
      chainId: chain.id,
      address: newAddress as `0x${string}`,
      label: newLabel.trim(),
      kind: newKind,
      isPublic: newIsPublic
    }
    addEntry(entry)
    persistAddressBookUpsert(entry, connectedAddress)
    setNewAddress('')
    setNewLabel('')
    setNewKind('wallet')
    setNewIsPublic(false)
  }

  const needle = search.trim().toLowerCase()
  const visibleEntries = chainEntries.filter(
    (e) => needle === '' || `${e.label} ${e.address}`.toLowerCase().includes(needle)
  )

  return (
    <div className='grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'>
      {/* The book itself comes first: it is what people come here to read */}
      <SectionCard
        title={`Saved addresses${chain != null ? ` on ${chain.name}` : ''}`}
        flush
        action={
          chainEntries.length > 0 ? (
            <label className='flex h-8 w-44 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm'>
              <SearchIcon className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
              <span className='sr-only'>Search saved addresses</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search'
                className='w-full bg-transparent outline-none placeholder:text-muted-foreground'
              />
            </label>
          ) : undefined
        }
      >
        {chainEntries.length === 0 ? (
          <p className='p-5 text-sm text-muted-foreground'>
            Nothing saved yet for this network. Add an address, or label one of the known addresses.
          </p>
        ) : visibleEntries.length === 0 ? (
          <p className='p-5 text-sm text-muted-foreground'>No saved address matches this search.</p>
        ) : (
          <div className='divide-y divide-border'>
            {visibleEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                explorerUrl={chain?.blockExplorers?.default?.url}
                ownerAddress={connectedAddress}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <div className='flex min-w-0 flex-col gap-4'>
        <SectionCard title='Add an address'>
          <div className='flex flex-col gap-3'>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              Labels are stored in this browser and shown wherever this address appears — in the request builder, the
              activity feed, and owner lists.
            </p>
            <TextInput
              className='font-mono md:w-full'
              placeholder='Address (0x...)'
              value={newAddress}
              isInvalid={newAddress !== '' && !isAddress(newAddress)}
              onChange={(e) => setNewAddress(e.target.value.trim())}
            />
            <div className='grid grid-cols-[minmax(0,1fr)_auto] gap-3'>
              <TextInput
                className='md:w-full'
                placeholder='Label (e.g. Treasury, USDC)'
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
              <Select value={newKind} onValueChange={(v) => setNewKind(v as AddressBookEntryKind)}>
                <SelectTrigger className='w-28'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='wallet'>Wallet</SelectItem>
                  <SelectItem value='contract'>Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {duplicate && (
              <p className='text-xs text-destructive'>This address is already in the book for this network.</p>
            )}
            <label className='flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3'>
              <span className='flex flex-col gap-0.5'>
                <span className='text-sm font-medium text-foreground'>Share publicly</span>
                <span className='text-xs text-muted-foreground'>
                  Public entries can be seen by the MyMultiSig team, helping widely used contracts get official
                  support. Private entries stay visible to you alone.
                </span>
              </span>
              <Switch checked={newIsPublic} onCheckedChange={setNewIsPublic} />
            </label>
            <Button className='gap-2 self-start' onClick={handleAdd} disabled={!canAdd}>
              <AddIcon className='h-4 w-4' />
              Add to book
            </Button>
          </div>
        </SectionCard>

        {suggestions.length > 0 && (
          <SectionCard title='Known addresses you could label' flush>
            <ul className='divide-y divide-border'>
              {suggestions.map((s) => (
                <li key={s.address} className='flex items-center gap-3 px-5 py-3'>
                  <Identicon value={s.address} size={28} />
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-semibold text-foreground'>{s.label}</span>
                    <span className='font-mono text-xs text-muted-foreground'>{truncateAddress(s.address)}</span>
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    className='shrink-0 gap-1'
                    onClick={() => {
                      if (chain == null) return
                      addEntry({ chainId: chain.id, ...s })
                      persistAddressBookUpsert({ chainId: chain.id, ...s }, connectedAddress)
                    }}
                  >
                    <AddIcon className='h-3.5 w-3.5' />
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </div>
  )
}

export default AddressBook
