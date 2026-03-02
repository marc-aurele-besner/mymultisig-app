import React from 'react'
import { Textarea as ChakraTextarea } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import {} from '@chakra-ui/color-mode'

interface TextareaProps {
  placeholder: string
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  isDisabled?: boolean
  readOnly?: boolean
  isInvalid?: boolean
}

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  defaultValue,
  value,
  onChange,
  isDisabled,
  readOnly,
  isInvalid
}) => {
  return (
    <ChakraTextarea
      w={{ base: '100%', md: '94%' }}
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
      disabled={isDisabled}
      readOnly={readOnly}
      _placeholder={{
        color: 'gray.200'
      }}
    />
  )
}

export default Textarea
