import React from 'react'
import { Contract } from '../../models/Contracts'
import TextInput from '../inputs/TextInput'
import Textarea from '../inputs/Textarea'
import Switch from '../inputs/Switch'
import { Label } from '@/components/ui/label'

interface AddContactFormProps {
  contract: Contract
  setContract: React.Dispatch<React.SetStateAction<Contract>>
}

const AddContactForm: React.FC<AddContactFormProps> = ({ contract, setContract }) => {
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>, input: keyof Contract) => {
    setContract({ ...contract, [input]: event.target.value })
  }

  const handleChangeABI = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      setContract({ ...contract, abi: JSON.parse(event.target.value) })
    } catch {
      // ignore invalid JSON
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Label className="text-base font-bold text-foreground">Contract Name</Label>
      <TextInput
        placeholder="Contract Name"
        value={contract.name}
        onChange={(e) => handleValueChange(e, 'name')}
      />
      <Label className="text-base font-bold text-foreground">Contract Address</Label>
      <TextInput
        placeholder="Contract Address"
        value={contract.address}
        onChange={(e) => handleValueChange(e, 'address')}
      />
      <Label className="text-base font-bold text-foreground">Contract ABI</Label>
      <Textarea
        placeholder="Contract ABI (JSON)"
        value={JSON.stringify(contract.abi, null, 2)}
        onChange={handleChangeABI}
      />
      <Switch
        placeholder="Is Public"
        checked={contract.isPublic}
        onCheckedChange={(checked) => setContract({ ...contract, isPublic: checked })}
      />
    </div>
  )
}

export default AddContactForm
