import React, { useState } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddIcon, DeleteIcon, CheckIcon, ExternalLinkIcon } from '../icons/ChakraIcons'

import TextInput from '../inputs/TextInput'
import useAddressBook, { AddressBookEntry, AddressBookEntryKind } from '../../states/addressBook'
import useContracts from '../../states/contracts'
import useMultiSigs from '../../states/multiSigs'
import { persistAddressBookUpsert, persistAddressBookRemoval } from '../../utils/addressBookSync'

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
        { chainId: entry.chainId, address: entry.address, label: label.trim(), kind: entry.kind },
        ownerAddress
      )
    }
    setEditing(false)
  }

  const handleRemove = () => {
    removeEntry(entry.id)
    persistAddressBookRemoval(entry, ownerAddress)
  }

  return (
    <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3'>
      <div className='flex min-w-0 flex-col gap-0.5'>
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
        <span className='break-all font-mono text-xs text-muted-foreground'>{entry.address}</span>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${KIND_BADGE[entry.kind]}`}>
          {entry.kind === 'contract' ? 'Contract' : 'Wallet'}
        </span>
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
    const entry = { chainId: chain.id, address: newAddress as `0x${string}`, label: newLabel.trim(), kind: newKind }
    addEntry(entry)
    persistAddressBookUpsert(entry, connectedAddress)
    setNewAddress('')
    setNewLabel('')
    setNewKind('wallet')
  }

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 rounded-xl border border-border p-4'>
        <div>
          <h3 className='text-base font-semibold text-foreground'>Add an address</h3>
          <p className='text-sm text-muted-foreground'>
            Labels are stored in this browser and shown wherever this address appears — in the request builder, the
            activity feed, and owner lists.
          </p>
        </div>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_auto_auto]'>
          <TextInput
            className='md:w-full'
            placeholder='Address (0x...)'
            value={newAddress}
            isInvalid={newAddress !== '' && !isAddress(newAddress)}
            onChange={(e) => setNewAddress(e.target.value.trim())}
          />
          <TextInput
            className='md:w-full'
            placeholder='Label (e.g. Treasury, USDC)'
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <Select value={newKind} onValueChange={(v) => setNewKind(v as AddressBookEntryKind)}>
            <SelectTrigger className='w-full md:w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='wallet'>Wallet</SelectItem>
              <SelectItem value='contract'>Contract</SelectItem>
            </SelectContent>
          </Select>
          <Button className='gap-2' onClick={handleAdd} disabled={!canAdd}>
            <AddIcon className='h-4 w-4' />
            Add
          </Button>
        </div>
        {duplicate && <p className='text-xs text-destructive'>This address is already in the book for this network.</p>}
      </div>

      {suggestions.length > 0 && (
        <div className='flex flex-col gap-2 rounded-xl border border-border p-4'>
          <h3 className='text-base font-semibold text-foreground'>Known addresses you could label</h3>
          {suggestions.map((s) => (
            <div
              key={s.address}
              className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border p-3'
            >
              <div className='flex min-w-0 flex-col gap-0.5'>
                <span className='text-sm font-semibold text-foreground'>{s.label}</span>
                <span className='break-all font-mono text-xs text-muted-foreground'>{s.address}</span>
              </div>
              <Button
                size='sm'
                variant='outline'
                className='gap-1'
                onClick={() => {
                  if (chain == null) return
                  addEntry({ chainId: chain.id, ...s })
                  persistAddressBookUpsert({ chainId: chain.id, ...s }, connectedAddress)
                }}
              >
                <AddIcon className='h-3.5 w-3.5' />
                Add to book
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className='flex flex-col gap-2'>
        <h3 className='text-base font-semibold text-foreground'>
          Saved addresses{chain != null ? ` on ${chain.name}` : ''}
        </h3>
        {chainEntries.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Nothing saved yet for this network. Add an address above or label one of the known addresses.
          </p>
        ) : (
          chainEntries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              explorerUrl={chain?.blockExplorers?.default?.url}
              ownerAddress={connectedAddress}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default AddressBook
