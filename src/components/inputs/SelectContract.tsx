import React from 'react'
import { Select } from '@chakra-ui/react'

import useContracts from '../../states/contracts'

interface SelectContractProps {
  onChange: (e: string) => void
}

const SelectContract: React.FC<SelectContractProps> = ({ onChange }) => {
  const contracts = useContracts((state) => state.contracts)

  return (
    <Select
      placeholder='Select contract'
      color='white'
      onChange={(e) => onChange(e.target.value)}
      _focus={{
        color: 'white'
      }}>
      {contracts.map((contract) => (
        <option
          key={contract.id}
          value={contract.isMultiSig ? 'itSelf' : contract.id}
          style={{
            color: 'white'
          }}>
          {contract.name}
        </option>
      ))}
      <option
        value='newContract'
        style={{
          color: 'white'
        }}>
        + New contract
      </option>
    </Select>
  )
}

export default SelectContract
