import React from 'react'
import { Select } from '@chakra-ui/react'

interface SelectFunctionProps {
  onChange: (e: string) => void
}

const SelectFunction: React.FC<SelectFunctionProps> = ({ onChange }) => {
  return (
    <Select
      placeholder='Select Function'
      color='white'
      onChange={(e) => onChange(e.target.value)}
      _focus={{
        color: 'black',
      }}>
      <option value='itSelf'>addOwner</option>
    </Select>
  )
}

export default SelectFunction
