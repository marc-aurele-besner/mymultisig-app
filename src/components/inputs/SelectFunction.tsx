import React from 'react'
import { Select } from '@chakra-ui/react'
import { JsonFragment } from '@ethersproject/abi'

import { buildRawSignatureFromFunction } from '../../utils/buildFunctionSignature'

interface SelectFunctionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any[] | undefined
  onChange: (e: string) => void
}

const SelectFunction: React.FC<SelectFunctionProps> = ({ abi, onChange }) => {
  const filterFunction =
    abi &&
    abi.filter(
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
      {filterFunction &&
        filterFunction.length > 0 &&
        filterFunction.map((item: JsonFragment) => (
          <option
            key={item.name}
            value={buildRawSignatureFromFunction(item)}
            style={{
              color: 'white'
            }}>
            {item.name}
          </option>
        ))}
    </Select>
  )
}

export default SelectFunction
