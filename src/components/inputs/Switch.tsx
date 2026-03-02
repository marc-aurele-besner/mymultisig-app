import React from 'react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import { Switch as ChakraSwitch } from '@chakra-ui/switch'

interface SwitchProps {
  placeholder: string
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  isDisabled?: boolean
  readOnly?: boolean
  isInvalid?: boolean
}

const Switch: React.FC<SwitchProps> = ({
  placeholder,
  defaultValue,
  value,
  onChange,
  isDisabled,
  readOnly,
  isInvalid
}) => {
  return (
    <FormControl w={{ base: '100%', md: '94%' }} display='flex' alignItems='center'>
      <FormLabel htmlFor='email-alerts' mb='0'>
        {placeholder}
      </FormLabel>
      <ChakraSwitch
        w={{ base: '50%', md: '40%' }}
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
        _invalid={{ borderColor: "red.500" }}
        _placeholder={{
          color: 'gray.200'
        }}
      />
    </FormControl>
  )
}

export default Switch
