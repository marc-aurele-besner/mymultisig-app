import React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  placeholder: string
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  isDisabled?: boolean
  readOnly?: boolean
  isInvalid?: boolean
}

const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  defaultValue,
  value,
  onChange,
  isDisabled,
  readOnly,
  isInvalid,
  className,
  ...rest
}) => {
  return (
    <Input
      className={cn(
        'h-auto w-full py-4 px-5 text-base md:w-[94%] md:text-sm',
        isInvalid && 'border-destructive focus-visible:ring-destructive'
      )}
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      disabled={isDisabled}
      readOnly={readOnly}
      {...rest}
    />
  )
}

export default TextInput
