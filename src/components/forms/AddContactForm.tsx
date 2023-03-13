import React, { useState } from 'react'
// import Link from 'next/link'
import { VStack, Text } from '@chakra-ui/react'
import { useNetwork } from 'wagmi'
import { v4 } from 'uuid'

import { Contract } from '../../models/Contracts'
import TextInput from '../inputs/TextInput'
import Textarea from '../inputs/Textarea'
// import ConfirmationCard from '../cards/ConfirmationCard'
// import NumberInput from '../inputs/NumberInput'
import Switch from '../inputs/Switch'
// import useCreateMultiSig from '../../hooks/useCreateMultiSig'

interface AddContactFormProps {
  creator: `0x${string}`
}

const AddContactForm: React.FC<AddContactFormProps> = ({ creator }) => {
  const { chain } = useNetwork()
  const [contract, setContract] = useState<Contract>({
    chainId: chain ? chain.id : 1,
    chainName: chain ? chain.name : 'Ethereum',
    id: v4(),
    name: '',
    address: '0x',
    creator,
    abi: [],
    isPublic: false,
    isVerified: false,
    isWhitelisted: false,
    isChainSpecific: false,
    isWalletSpecific: true
  })

  const handleValueChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    input: keyof Contract
  ) => {
    setContract({ ...contract, [input]: event.target.value })
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
          handleValueChange(e, 'abi')
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
