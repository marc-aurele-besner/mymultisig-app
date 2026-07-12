import React from 'react'
import { Switch as ShadcnSwitch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface SwitchProps {
  placeholder: string
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  isDisabled?: boolean
  readOnly?: boolean
  isInvalid?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch: React.FC<SwitchProps> = ({
  placeholder,
  checked,
  onCheckedChange,
  isDisabled,
  readOnly
}) => {
  return (
    <div className="flex w-full items-center md:w-[94%]">
      <Label htmlFor="switch-label" className="mb-0 flex-1">
        {placeholder}
      </Label>
      <ShadcnSwitch
        id="switch-label"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={isDisabled || readOnly}
      />
    </div>
  )
}

export default Switch
