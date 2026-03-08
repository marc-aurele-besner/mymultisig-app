import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import useContracts from '../../states/contracts'

interface SelectContractProps {
  onChange: (e: string) => void
}

const SelectContract: React.FC<SelectContractProps> = ({ onChange }) => {
  const contracts = useContracts((state) => state.contracts)
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
        <SelectValue placeholder="Select contract" />
      </SelectTrigger>
      <SelectContent>
        {contracts.map((contract) => (
          <SelectItem key={contract.id} value={contract.isMultiSig ? 'itSelf' : contract.id}>
            {contract.name}
          </SelectItem>
        ))}
        <SelectItem value="newContract">+ New contract</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default SelectContract
