import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import TextInput from './TextInput'
import { AddressBookIcon } from '../icons/ChakraIcons'
import useAddressBook, { useAddressLabels } from '../../states/addressBook'
import { persistAddressBookUpsert } from '../../utils/addressBookSync'

interface AddressBookInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isInvalid?: boolean
  id?: string
  // Offer to label-and-save valid addresses that are not in the book yet.
  allowSave?: boolean
}

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

// A regular address input that doubles as an address-book combobox: type any
// address freely, or open the dropdown to pick a saved entry. Used by every
// address field in the request builder (contract args, receiver, batch steps).
const AddressBookInput: React.FC<AddressBookInputProps> = ({
  value,
  onChange,
  placeholder = '0x…',
  isInvalid,
  id,
  allowSave = false
}) => {
  const chainId = useChainId()
  const { address: account } = useAccount()
  const { entries, labelFor } = useAddressLabels(chainId)
  const { addEntry } = useAddressBook()
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const [saveLabel, setSaveLabel] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (q === '' || q === '0x') return entries
    return entries.filter((e) => e.label.toLowerCase().includes(q) || e.address.toLowerCase().includes(q))
  }, [entries, value])

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (highlighted >= filtered.length) setHighlighted(0)
  }, [filtered.length, highlighted])

  const select = (address: string) => {
    onChange(address)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      else setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && open && filtered[highlighted] != null) {
      e.preventDefault()
      select(filtered[highlighted].address)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const knownLabel = isAddress(value) ? labelFor(value) : null

  return (
    <div ref={wrapperRef} className='relative flex w-full flex-col gap-1.5'>
      <div className='relative w-full'>
        <TextInput
          id={id}
          role='combobox'
          aria-expanded={open}
          aria-autocomplete='list'
          className='pr-11 font-mono md:w-full'
          placeholder={placeholder}
          value={value}
          isInvalid={isInvalid}
          spellCheck={false}
          autoComplete='off'
          onChange={(e) => {
            onChange(e.target.value.trim())
            if (entries.length > 0) setOpen(true)
          }}
          onFocus={() => {
            if (entries.length > 0 && !isAddress(value)) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type='button'
          tabIndex={-1}
          aria-label='Show address book'
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors',
            open ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <AddressBookIcon className='h-4 w-4' />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            role='listbox'
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='absolute top-full z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-lg'
          >
            {filtered.length === 0 ? (
              <li className='px-3 py-2.5 text-sm text-muted-foreground'>
                {entries.length === 0
                  ? 'No saved addresses on this network yet. Label addresses as you use them and they will show up here.'
                  : 'No saved address matches this input.'}
              </li>
            ) : (
              filtered.map((entry, index) => (
                <li key={entry.id}>
                  <button
                    type='button'
                    role='option'
                    aria-selected={index === highlighted}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => select(entry.address)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors',
                      index === highlighted ? 'bg-accent' : 'hover:bg-accent'
                    )}
                  >
                    <span className='flex items-center gap-2 text-sm font-medium text-foreground'>
                      {entry.label}
                      <span className='rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-normal text-muted-foreground'>
                        {entry.kind}
                      </span>
                    </span>
                    <span className='break-all font-mono text-xs text-muted-foreground'>{entry.address}</span>
                  </button>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>

      {isInvalid && <span className='text-xs text-destructive'>This is not a valid address</span>}
      {knownLabel != null && (
        <span className='text-xs text-muted-foreground'>
          Known as <span className='font-semibold text-foreground'>{knownLabel}</span> in your address book.
        </span>
      )}
      {allowSave && isAddress(value) && knownLabel == null && (
        <div className='flex flex-wrap items-center gap-2 pt-1'>
          <TextInput
            className='h-auto w-56 py-1.5 md:w-56'
            placeholder='Label this address (optional)'
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
          />
          <Button
            size='sm'
            variant='outline'
            disabled={saveLabel.trim() === ''}
            onClick={() => {
              const entry = {
                chainId,
                address: value as `0x${string}`,
                label: saveLabel.trim(),
                kind: 'wallet' as const
              }
              addEntry(entry)
              persistAddressBookUpsert(entry, account)
              setSaveLabel('')
            }}
          >
            Save to address book
          </Button>
        </div>
      )}
    </div>
  )
}

export default AddressBookInput
