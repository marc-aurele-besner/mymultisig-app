import React from 'react'
import { Input } from '@chakra-ui/react'

interface TextInputProps {
  placeholder: string
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
}

const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  defaultValue,
  value,
  onChange,
  isDisabled,
  isReadOnly,
  isInvalid
}) => {
  return (
    <Input
      w='94%'
      p={4}
      m={2}
      mt={4}
      borderRadius={10}
      bg='cyan.100'
      boxShadow='lg'
      color={'white'}
      backgroundColor='transparent'
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      _placeholder={{
        color: 'gray.200'
      }}
    />
  )
}

export default TextInput
