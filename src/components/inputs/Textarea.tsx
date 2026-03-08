import React from 'react'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface TextareaProps {
  placeholder: string
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  isDisabled?: boolean
  readOnly?: boolean
  isInvalid?: boolean
  className?: string
}

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  defaultValue,
  value,
  onChange,
  isDisabled,
  readOnly,
  isInvalid,
  className
}) => {
  return (
    <ShadcnTextarea
      className={cn(
        'mt-4 w-full p-4 md:w-[94%]',
        isInvalid && 'border-destructive focus-visible:ring-destructive'
      )}
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      disabled={isDisabled}
      readOnly={readOnly}
    />
  )
}

export default Textarea
