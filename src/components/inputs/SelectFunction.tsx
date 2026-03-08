import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { JsonFragment } from '@ethersproject/abi'
import { buildRawSignatureFromFunction } from '../../utils/buildFunctionSignature'

interface SelectFunctionProps {
  abi: JsonFragment[] | null
  onChange: (e: string) => void
}

const SelectFunction: React.FC<SelectFunctionProps> = ({ abi, onChange }) => {
  const filterFunction =
    abi &&
    abi.filter(
      (item: JsonFragment) =>
        item.type === 'function' &&
        item.stateMutability !== 'view' &&
        item.stateMutability !== 'pure'
    )
  const [value, setValue] = React.useState<string>('')

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        setValue(v)
        onChange(v)
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Function" />
      </SelectTrigger>
      <SelectContent>
        {filterFunction?.map((item: JsonFragment) => (
          <SelectItem
            key={item.name}
            value={buildRawSignatureFromFunction(item)}
          >
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectFunction
