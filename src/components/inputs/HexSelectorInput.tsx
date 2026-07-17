import React, { useMemo, useState } from 'react'
import { Abi, toFunctionSelector } from 'viem'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import TextInput from './TextInput'

interface KnownSelector {
  selector: `0x${string}`
  label: string
  hint: string
}

interface HexSelectorInputProps {
  // 4-byte function selector (0x + 8 hex chars). Empty string clears.
  value: string
  onChange: (selector: string) => void
  // Wallet ABIs we want to recognise by name so the dropdown can show a
  // readable label rather than ask users to paste a hash.
  abis: Abi[]
  // Optional set of hex selectors to surface pre-registered.
  extra?: KnownSelector[]
  isInvalid?: boolean
  helperText?: string
  disabled?: boolean
}

const isBytes4 = (value: string) => /^0x[a-fA-F0-9]{8}$/.test(value)

const CUSTOM_VALUE = '__custom__'

// Friendly hex selector entry. Recognises the wallet's own writeable admin
// selectors (and any extras the caller hands in) via a dropdown; "Custom…"
// falls back to a raw 4-byte input so power users can paste any hash.
const HexSelectorInput: React.FC<HexSelectorInputProps> = ({
  value,
  onChange,
  abis,
  extra,
  isInvalid,
  helperText,
  disabled
}) => {
  // Build the dropdown entries once per ABI change. Same selector showing up
  // under multiple names keeps the first label; the hint tells the user what
  // the wallet would do if it executed the call.
  const knownSelectors = useMemo<KnownSelector[]>(() => {
    const seen = new Map<string, KnownSelector>()
    const consider = (name: string, hash: `0x${string}`, hint: string) => {
      if (!isBytes4(hash)) return
      const key = hash.toLowerCase()
      if (!seen.has(key)) seen.set(key, { selector: hash, label: name, hint })
    }
    for (const abi of abis) {
      for (const item of abi as readonly unknown[]) {
        // Only callable, non-view entries make sense in the timelock-sensitive
        // context this dropdown feeds.
        const fn = item as { type?: string; name?: string; stateMutability?: string }
        if (fn?.type !== 'function' || !fn.name) continue
        if (fn.stateMutability === 'view' || fn.stateMutability === 'pure') continue
        try {
          const selector = toFunctionSelector(fn as never) as `0x${string}`
          consider(fn.name, selector, `Signature: ${fn.name}`)
        } catch {
          // Skip fragments viem can't encode (e.g. tuples in the args).
        }
      }
    }
    if (extra != null) {
      for (const entry of extra) {
        const key = entry.selector.toLowerCase()
        if (!seen.has(key)) seen.set(key, entry)
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [abis, extra])

  // Decide which option matches the current raw value.
  const matched = useMemo(() => knownSelectors.find((k) => k.selector.toLowerCase() === (value ?? '').toLowerCase()), [
    knownSelectors,
    value
  ])

  const [customOpen, setCustomOpen] = useState(false)
  const showCustom = !isBytes4(value)

  const handleSelect = (next: string) => {
    if (next === CUSTOM_VALUE) {
      setCustomOpen(true)
      return
    }
    setCustomOpen(false)
    onChange(next)
  }

  return (
    <div className='flex w-full flex-col gap-1.5'>
      {!customOpen && !showCustom ? (
        <Select value={matched?.selector ?? ''} onValueChange={handleSelect} disabled={disabled}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Pick a wallet function'>
              {matched ? matched.label : 'Pick a wallet function'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {knownSelectors.map((entry) => (
              <SelectItem key={entry.selector} value={entry.selector}>
                <span className='flex flex-col'>
                  <span>{entry.label}</span>
                  <span className='font-mono text-[10px] text-muted-foreground'>{entry.selector}</span>
                </span>
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_VALUE}>Custom 4-byte selector…</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <TextInput
          className='font-mono md:w-full'
          placeholder='0x7065cb48'
          value={value}
          isInvalid={isInvalid}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.trim())}
        />
      )}

      <div className='flex flex-wrap items-center gap-2'>
        <span
          className={cn(
            'rounded px-2 py-0.5 font-mono text-xs',
            isBytes4(value) ? 'bg-muted text-foreground' : 'text-muted-foreground'
          )}
        >
          {isBytes4(value) ? value : 'no selector yet'}
        </span>
        {matched != null && (
          <span className='text-xs text-muted-foreground'>— {matched.hint}</span>
        )}
        {helperText != null && <span className='text-xs text-muted-foreground'>{helperText}</span>}
      </div>

      <button
        type='button'
        className='self-start text-xs font-medium text-primary hover:underline'
        onClick={() => setCustomOpen((open) => !open)}
      >
        {customOpen || showCustom ? 'Pick from the wallet functions' : 'Enter a hex selector manually'}
      </button>
    </div>
  )
}

export default HexSelectorInput
export type { KnownSelector }
