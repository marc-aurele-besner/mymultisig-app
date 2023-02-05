import React from 'react'
import { Input } from '@chakra-ui/react'

interface TextInputProps {
  placeholder: string
}

const TextInput: React.FC<TextInputProps> = ({ placeholder }) => {
  return (
    <Input w='94%' p={4} m={2} mt={4} borderRadius={10} bg='cyan.100' boxShadow='dark-lg' placeholder={placeholder} />
  )
}

export default TextInput
