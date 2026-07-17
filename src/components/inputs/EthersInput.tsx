import React, { useEffect, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import TextInput from './TextInput'

type Mode = 'eth' | 'wei'

interface EthersInputProps {
  // Raw wei as a string — same shape every downstream consumer already
  // reads (`BigInt(value)` for the contract arg).
  value: string
  onChange: (wei: string) => void
  // ERC-20 tokens: pass decimals here and override the unit label.
  decimals?: number
  symbol?: string
  isInvalid?: boolean
  helperText?: string
  // Upper bound shown next to the field as a friendly hint (e.g. the rolling
  // daily allowance cap). Wired but optional.
  balanceHint?: bigint
  disabled?: boolean
}

const isUint = (value: string) => /^\d+$/.test(value)

// Amount entry that defaults to a decimal native-currency field and keeps a
// "Wei (raw units)" toggle for power users or amounts below the smallest
// displayable unit. The string it emits is always the integer wei count so
// encodeFunctionData() stays unchanged.
const EthersInput: React.FC<EthersInputProps> = ({
  value,
  onChange,
  decimals = 18,
  symbol = 'ETH',
  isInvalid,
  helperText,
  balanceHint,
  disabled
}) => {
  const [mode, setMode] = useState<Mode>('eth')
  const [decimal, setDecimal] = useState('')

  const wei = useMemo(() => {
    if (value === '' || !isUint(value)) return null
    try {
      return BigInt(value)
    } catch {
      return null
    }
  }, [value])

  const formatDecimal = (rawWei: bigint): string => {
    try {
      // viem is fine with fractional ether up to the token's decimals; we
      // trim trailing zeros so 1.0 ETH doesn't print as "1.0000".
      const formatted = formatEther(rawWei)
      return formatted.includes('.') ? formatted.replace(/\.?0+$/, '') : formatted
    } catch {
      return ''
    }
  }

  // When the upstream value changes (e.g. action re-selection), reflect the
  // new decimal value in the input.
  useEffect(() => {
    if (mode === 'eth') setDecimal(wei == null ? '' : formatDecimal(wei))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const commitDecimal = (next: string) => {
    setDecimal(next)
    if (next.trim() === '') {
      onChange('')
      return
    }
    try {
      const parsed = parseEther(next)
      onChange(parsed.toString())
    } catch {
      // Invalid decimal — let validation in the parent surface the error.
    }
  }

  // Friendly preview of an integer wei value, useful for non-18-decimal tokens.
  const previewFriendly = (rawWei: bigint): string => {
    if (decimals === 18) return formatEther(rawWei)
    const negative = rawWei < 0n
    let raw = negative ? -rawWei : rawWei
    const base = 10n ** BigInt(decimals)
    const whole = raw / base
    const fraction = (raw % base).toString().padStart(decimals, '0').replace(/0+$/, '')
    const wholeStr = whole.toLocaleString()
    return `${negative ? '-' : ''}${wholeStr}${fraction ? `.${fraction}` : ''}`
  }

  return (
    <div className='flex w-full flex-col gap-1.5'>
      {mode === 'eth' ? (
        <>
          <div className='flex w-full items-center gap-2'>
            <Input
              inputMode='decimal'
              placeholder={`Amount in ${symbol}`}
              value={decimal}
              disabled={disabled}
              onChange={(e) => commitDecimal(e.target.value.trim())}
              className={cn(
                'h-auto w-full px-4 py-3 text-base md:w-full md:text-sm',
                isInvalid && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {balanceHint != null && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={disabled}
                onClick={() => commitDecimal(previewFriendly(balanceHint))}
              >
                Max
              </Button>
            )}
          </div>
          <span className='text-xs text-muted-foreground'>
            {helperText ? `${helperText} — ` : ''}
            {wei != null ? (
              <>
                Wei value: <span className='font-mono text-foreground'>{wei.toString()}</span>
              </>
            ) : (
              <>Enter a {symbol} amount — convert to wei on submit.</>
            )}
          </span>
        </>
      ) : (
        <>
          <TextInput
            className='font-mono md:w-full'
            placeholder='Wei (integer)'
            value={value}
            isInvalid={isInvalid}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value.trim())}
          />
          {wei != null && (
            <span className='text-xs text-muted-foreground'>
              Friendly view: {previewFriendly(wei)} {symbol}
            </span>
          )}
        </>
      )}
      <button
        type='button'
        className='self-start text-xs font-medium text-primary hover:underline'
        onClick={() => {
          if (mode === 'eth') {
            setMode('wei')
          } else {
            if (wei != null) setDecimal(formatDecimal(wei))
            setMode('eth')
          }
        }}
      >
        {mode === 'eth' ? `Advanced (raw ${decimals === 18 ? 'wei' : 'units'})` : 'Back to friendly entry'}
      </button>
    </div>
  )
}

export default EthersInput
