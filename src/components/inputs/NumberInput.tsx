import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberInputProps {
  placeholder: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  defaultValue?: number
  value?: string
  min?: number
  max?: number
  precision?: number
  step?: number
  onChange?: (valueAsString: string, valueAsNumber: number) => void
  isDisabled?: boolean
  readOnly?: boolean
  isInvalid?: boolean
  hasStepper?: boolean
  allowMouseWheel?: boolean
}

const NumberInput: React.FC<NumberInputProps> = ({
  placeholder,
  defaultValue,
  value,
  min,
  max,
  step = 1,
  onChange,
  isDisabled,
  readOnly,
  isInvalid,
  hasStepper
}) => {
  const [internalValue, setInternalValue] = React.useState(
    value ?? (defaultValue != null ? String(defaultValue) : '')
  )

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  const numValue = parseFloat(internalValue) || 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInternalValue(v)
    const n = parseFloat(v)
    if (!Number.isNaN(n)) onChange?.(v, n)
  }

  const increment = () => {
    const next = numValue + step
    const clamped = max != null ? Math.min(next, max) : next
    const v = String(clamped)
    setInternalValue(v)
    onChange?.(v, clamped)
  }

  const decrement = () => {
    const next = numValue - step
    const clamped = min != null ? Math.max(next, min) : next
    const v = String(clamped)
    setInternalValue(v)
    onChange?.(v, clamped)
  }

  return (
    <div className={cn('flex w-full items-center gap-0 md:w-[94%]', hasStepper && 'rounded-lg border border-input')}>
      <input
        type="number"
        className={cn(
          'flex h-auto w-full rounded-lg border border-input bg-transparent px-5 py-4 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          hasStepper && 'border-0 rounded-r-none',
          isInvalid && 'border-destructive focus-visible:ring-destructive'
        )}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={isDisabled}
        readOnly={readOnly}
      />
      {hasStepper && (
        <div className="flex flex-col border-l border-input">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-8 rounded-none border-0 text-muted-foreground hover:text-primary"
            onClick={increment}
            disabled={isDisabled || (max != null && numValue >= max)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-8 rounded-none rounded-br-lg border-0 text-muted-foreground hover:text-primary"
            onClick={decrement}
            disabled={isDisabled || (min != null && numValue <= min)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default NumberInput
