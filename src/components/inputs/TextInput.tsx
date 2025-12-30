import React from 'react'
import { Input, InputProps } from '@chakra-ui/react'

interface TextInputProps extends Omit<InputProps, 'onChange'> {
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
  isInvalid,
  ...rest
}) => {
  return (
    <Input
      w={{ base: '100%', md: '94%' }}
      h='auto'
      py={4}
      px={5}
      m={2}
      borderRadius='xl'
      bg='whiteAlpha.50'
      border='1px solid'
      borderColor={isInvalid ? 'red.400' : 'whiteAlpha.200'}
      backdropFilter='blur(10px)'
      color='white'
      fontSize='md'
      fontWeight='500'
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      sx={{ transition: 'all 0.2s ease' }}
      _placeholder={{
        color: 'whiteAlpha.400',
        fontWeight: '400'
      }}
      _hover={{
        borderColor: isInvalid ? 'red.300' : 'whiteAlpha.300',
        bg: 'whiteAlpha.80'
      }}
      _focus={{
        borderColor: isInvalid ? 'red.400' : 'brand.400',
        boxShadow: isInvalid
          ? '0 0 0 1px rgba(245, 101, 101, 0.5), 0 0 20px rgba(245, 101, 101, 0.15)'
          : '0 0 0 1px rgba(56, 178, 172, 0.5), 0 0 20px rgba(56, 178, 172, 0.15)',
        outline: 'none',
        bg: 'whiteAlpha.100'
      }}
      _disabled={{
        opacity: 0.5,
        cursor: 'not-allowed'
      }}
      _readOnly={{
        opacity: 0.8,
        cursor: 'default'
      }}
      {...rest}
    />
  )
}

export default TextInput
