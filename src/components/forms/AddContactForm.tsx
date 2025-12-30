import React from 'react'
import { VStack, Text } from '@chakra-ui/react'

import { Contract } from '../../models/Contracts'
import TextInput from '../inputs/TextInput'
import Textarea from '../inputs/Textarea'
import Switch from '../inputs/Switch'

interface AddContactFormProps {
  contract: Contract
  setContract: React.Dispatch<React.SetStateAction<Contract>>
}

const AddContactForm: React.FC<AddContactFormProps> = ({ contract, setContract }) => {
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>, input: keyof Contract) => {
    setContract({ ...contract, [input]: event.target.value })
  }

  const handleChangeABI = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContract({ ...contract, abi: JSON.parse(event.target.value) })
  }

  return (
    <VStack>
      <Text fontSize='lg' fontWeight='bold' color='white' pb='1rem'>
        Contract Name
      </Text>
      <TextInput
        placeholder='Contract Name'
        onChange={(e) => {
          handleValueChange(e, 'name')
        }}
      />
      <Text fontSize='lg' fontWeight='bold' color='white' pb='1rem'>
        Contract Address
      </Text>
      <TextInput
        placeholder='Contract Address'
        onChange={(e) => {
          handleValueChange(e, 'address')
        }}
      />
      <Textarea
        placeholder='Contract ABI'
        onChange={(e) => {
          handleChangeABI(e)
        }}
      />
      <Switch
        placeholder='Is Public'
        onChange={(e) => {
          handleValueChange(e, 'isPublic')
        }}
      />
    </VStack>
  )
}

export default AddContactForm
