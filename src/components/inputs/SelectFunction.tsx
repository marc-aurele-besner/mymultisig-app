import React from 'react'
import { Select } from '@chakra-ui/react'

interface SelectFunctionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any[]
  onChange: (e: string) => void
}

const SelectFunction: React.FC<SelectFunctionProps> = ({ abi, onChange }) => {
  const filterFunction = abi.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (abi: any) => abi.type === 'function' && abi.stateMutability !== 'view' && abi.stateMutability !== 'pure'
  )
  return (
    <Select
      placeholder='Select Function'
      color='white'
      onChange={(e) => onChange(e.target.value)}
      _focus={{
        color: 'white'
      }}>
      {filterFunction.length > 0 &&
        filterFunction.map((item: { name: string }) => {
          return (
            <option
              key={item.name}
              value={item.name}
              style={{
                color: 'white'
              }}>
              {item.name}
            </option>
          )
        })}
    </Select>
  )
}

export default SelectFunction
