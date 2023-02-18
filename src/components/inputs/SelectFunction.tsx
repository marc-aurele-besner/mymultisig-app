import React from 'react'
import { Select } from '@chakra-ui/react'

interface SelectFunctionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any[]
  onChange: (e: string) => void
}

const SelectFunction: React.FC<SelectFunctionProps> = ({ abi, onChange }) => {
  return (
    <Select
      placeholder='Select Function'
      color='white'
      onChange={(e) => onChange(e.target.value)}
      _focus={{
        color: 'black'
      }}>
      {abi.length > 0 &&
        abi.map((item: { name: string }) => {
          return (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          )
        })}
      <option value='itSelf'>addOwner</option>
    </Select>
  )
}

export default SelectFunction
