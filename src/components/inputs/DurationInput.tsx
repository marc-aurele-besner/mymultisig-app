import React, { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import TextInput from './TextInput'

type Mode = 'friendly' | 'raw'

interface DurationInputProps {
  // String of seconds (matches the contract's uint256 value): the field shape
  // every other stage still consumes.
  value: string
  onChange: (seconds: string) => void
  isInvalid?: boolean
  // If set, the contract's minimum allowed seconds (e.g. the 7-day floor on
  // ownership delegation). Shown as a friendly hint, not enforced here.
  minSeconds?: bigint
  // Prefixed to the helper text under the field.
  helperText?: string
  disabled?: boolean
}

// 1d / 1h / 1m defaults so the timelock + inactivity windows don't open on
// the unfriendly "0 seconds" value.
const DEFAULT_FRIENDLY = { days: 1, hours: 0, minutes: 0 }

const splitSeconds = (seconds: bigint): { days: number; hours: number; minutes: number; leftover: number } => {
  let remaining = seconds
  const days = remaining / 86400n
  remaining -= days * 86400n
  const hours = remaining / 3600n
  remaining -= hours * 3600n
  const minutes = remaining / 60n
  remaining -= minutes * 60n
  return {
    days: Number(days),
    hours: Number(hours),
    minutes: Number(minutes),
    leftover: Number(remaining)
  }
}

const composeSeconds = (days: number, hours: number, minutes: number): bigint => {
  const safe = (n: number) => Math.max(0, Math.floor(n))
  return BigInt(safe(days)) * 86400n + BigInt(safe(hours)) * 3600n + BigInt(safe(minutes)) * 60n
}

const formatDuration = (seconds: bigint): string => {
  if (seconds === 0n) return '0 seconds'
  const { days, hours, minutes } = splitSeconds(seconds)
  const parts: string[] = []
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`)
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
  return parts.join(' ')
}

// Friendly duration entry. By default the field collects days/hours/minutes and
// surfaces the total seconds; an "Advanced (raw seconds)" toggle exposes the
// raw uint256 so callers comfortable with seconds can paste values directly.
const DurationInput: React.FC<DurationInputProps> = ({
  value,
  onChange,
  isInvalid,
  minSeconds,
  helperText,
  disabled
}) => {
  // Power users may paste raw seconds directly; we keep the mode explicit so a
  // round-trip doesn't silently unit-convert a non-aligned value.
  const [mode, setMode] = useState<Mode>('friendly')
  const [days, setDays] = useState(DEFAULT_FRIENDLY.days)
  const [hours, setHours] = useState(DEFAULT_FRIENDLY.hours)
  const [minutes, setMinutes] = useState(DEFAULT_FRIENDLY.minutes)

  const seconds = useMemo(() => {
    if (value === '' || !/^\d+$/.test(value)) return null
    try {
      return BigInt(value)
    } catch {
      return null
    }
  }, [value])

  const seedFromValue = (raw: string) => {
    if (!/^\d+$/.test(raw)) return
    const split = splitSeconds(BigInt(raw))
    setDays(split.days)
    setHours(split.hours)
    setMinutes(split.minutes)
  }

  // When callers reset the form (admin action re-selection), keep the
  // friendly sub-fields in sync with the new raw value.
  useEffect(() => {
    if (mode === 'friendly' && seconds != null) seedFromValue(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const apply = (nextDays: number, nextHours: number, nextMinutes: number) => {
    setDays(nextDays)
    setHours(nextHours)
    setMinutes(nextMinutes)
    onChange(composeSeconds(nextDays, nextHours, nextMinutes).toString())
  }

  const friendlySummary =
    seconds == null ? 'Not set yet — defaults to one day once submitted.' : formatDuration(seconds)

  return (
    <div className='flex w-full flex-col gap-1.5'>
      {mode === 'friendly' ? (
        <>
          <div className='grid grid-cols-3 gap-2'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>Days</span>
              <Input
                type='number'
                inputMode='numeric'
                min={0}
                value={days}
                disabled={disabled}
                onChange={(e) => apply(Number(e.target.value), hours, minutes)}
                className={cn('h-auto w-full px-4 py-3 text-base md:w-full md:text-sm', isInvalid && 'border-destructive')}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>Hours</span>
              <Input
                type='number'
                inputMode='numeric'
                min={0}
                max={23}
                value={hours}
                disabled={disabled}
                onChange={(e) => apply(days, Number(e.target.value), minutes)}
                className={cn('h-auto w-full px-4 py-3 text-base md:w-full md:text-sm', isInvalid && 'border-destructive')}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>Minutes</span>
              <Input
                type='number'
                inputMode='numeric'
                min={0}
                max={59}
                value={minutes}
                disabled={disabled}
                onChange={(e) => apply(days, hours, Number(e.target.value))}
                className={cn('h-auto w-full px-4 py-3 text-base md:w-full md:text-sm', isInvalid && 'border-destructive')}
              />
            </div>
          </div>
          <span className='text-xs text-muted-foreground'>
            {helperText ? `${helperText} — ` : ''}Total: <span className='font-semibold text-foreground'>{friendlySummary}</span>
            {minSeconds != null && (
              <> · minimum required: <span className='font-mono'>{formatDuration(minSeconds)}</span></>
            )}
          </span>
        </>
      ) : (
        <>
          <TextInput
            className='md:w-full'
            placeholder='e.g. 86400 (1 day)'
            value={value}
            isInvalid={isInvalid}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value.trim())}
          />
          {seconds != null && (
            <span className='text-xs text-muted-foreground'>Friendly view: {formatDuration(seconds)}</span>
          )}
        </>
      )}
      <button
        type='button'
        className='self-start text-xs font-medium text-primary hover:underline'
        onClick={() => {
          if (mode === 'friendly') {
            // Going raw: keep the current friendly value as the underlying
            // seconds string so nothing changes on submit.
            setMode('raw')
          } else {
            seedFromValue(value)
            setMode('friendly')
          }
        }}
      >
        {mode === 'friendly' ? 'Advanced (raw seconds)' : 'Back to friendly entry'}
      </button>
    </div>
  )
}

export default DurationInput
