import React from 'react'
import { VStack, Text } from '@chakra-ui/react'

import TextInput from '../inputs/TextInput'
import NumberInput from '../inputs/NumberInput'

interface CreateMultiSigFormProps {
  owner01: string
}

const CreateMultiSigForm: React.FC<CreateMultiSigFormProps> = ({ owner01 }) => {
  return (
    <VStack>
      <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
        Chose a name for your Multi-Signature Contract
      </Text>
      <TextInput placeholder='MultiSig Name' />
      <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
        Add owners to your Multi-Signature Contract
      </Text>
      <TextInput placeholder={owner01} defaultValue={owner01} isReadOnly />
      <TextInput placeholder='owner02' />
      <TextInput placeholder='owner03' />
      <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
        Chose a threshold for your Multi-Signature Contract
      </Text>
      <NumberInput placeholder={owner01} defaultValue={owner01} min={1} max={3} step={1} hasStepper allowMouseWheel />
    </VStack>
  )
}

export default CreateMultiSigForm
