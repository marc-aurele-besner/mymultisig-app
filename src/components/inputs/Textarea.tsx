import React from 'react'
import { Textarea as ChakraTextarea } from '@chakra-ui/react'

interface TextareaProps {
  placeholder: string
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
}

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  defaultValue,
  value,
  onChange,
  isDisabled,
  isReadOnly,
  isInvalid
}) => {
  return (
    <ChakraTextarea
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

export default Textarea
