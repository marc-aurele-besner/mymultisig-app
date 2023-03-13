import React from 'react'
import { FormControl, FormLabel, Switch as ChakraSwitch } from '@chakra-ui/react'

interface SwitchProps {
  placeholder: string
  defaultValue?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  isDisabled?: boolean
  isReadOnly?: boolean
  isInvalid?: boolean
}

const Switch: React.FC<SwitchProps> = ({
  placeholder,
  defaultValue,
  value,
  onChange,
  isDisabled,
  isReadOnly,
  isInvalid
}) => {
  return (
    <FormControl w='94%' display='flex' alignItems='center'>
      <FormLabel htmlFor='email-alerts' mb='0'>
        {placeholder}
      </FormLabel>
      <ChakraSwitch
        w='40%'
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
    </FormControl>
  )
}

export default Switch
