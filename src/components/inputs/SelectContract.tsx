import React from 'react'
import { Select } from '@chakra-ui/react'

interface SelectContractProps {
  onChange: (e: string) => void
}

const SelectContract: React.FC<SelectContractProps> = ({ onChange }) => {
  return (
    <Select
      placeholder='Select contract'
      color='white'
      onChange={(e) => onChange(e.target.value)}
      _focus={{
        color: 'white'
      }}>
      <option
        value='itSelf'
        style={{
          color: 'white'
        }}>
        MyMultiSig
      </option>
    </Select>
  )
}

export default SelectContract
