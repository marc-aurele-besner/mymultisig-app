import React from 'react'
import {
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/number-input'
import {} from '@chakra-ui/color-mode'

interface NumberInputProps {
  placeholder: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  defaultValue?: number
  value?: string
  min?: number
  max?: number
  precision?: number
  step?: number
  onChange?: (valueAsString: string, valueAsNumber: number) => void
  isDisabled?: boolean
  readOnly?: boolean
  isInvalid?: boolean
  hasStepper?: boolean
  allowMouseWheel?: boolean
}

const NumberInput: React.FC<NumberInputProps> = ({
  placeholder,
  size = 'md',
  defaultValue,
  value,
  min,
  max,
  precision,
  step,
  onChange,
  isDisabled,
  readOnly,
  isInvalid,
  hasStepper,
  allowMouseWheel
}) => {
  return (
    <ChakraNumberInput
      w={{ base: '100%', md: '94%' }}
      m={2}
      size={size}
      borderRadius='xl'
      bg='whiteAlpha.50'
      backdropFilter='blur(10px)'
      color='white'
      defaultValue={defaultValue}
      min={min}
      max={max}
      precision={precision}
      step={step}
      value={value}
      onChange={onChange}
      _invalid={{ borderColor: "red.500" }}
      allowMouseWheel={allowMouseWheel}
    >
      <NumberInputField
        h='auto'
        py={4}
        px={5}
        borderRadius='xl'
        border='1px solid'
        borderColor={isInvalid ? 'red.400' : 'whiteAlpha.200'}
        fontSize='md'
        fontWeight='500'
        placeholder={placeholder}
        disabled={isDisabled}
        readOnly={readOnly}
        _placeholder={{
          color: 'whiteAlpha.400',
          fontWeight: '400'
        }}
        _hover={{
          borderColor: isInvalid ? 'red.300' : 'whiteAlpha.300'
        }}
        _focus={{
          borderColor: isInvalid ? 'red.400' : 'brand.400',
          boxShadow: isInvalid
            ? '0 0 0 1px rgba(245, 101, 101, 0.5), 0 0 20px rgba(245, 101, 101, 0.15)'
            : '0 0 0 1px rgba(56, 178, 172, 0.5), 0 0 20px rgba(56, 178, 172, 0.15)',
          outline: 'none'
        }}
      />
      {hasStepper && (
        <NumberInputStepper
          border='none'
          pr={2}
        >
          <NumberIncrementStepper
            color='whiteAlpha.600'
            border='none'
            _hover={{ color: 'brand.300' }}
            _active={{ color: 'brand.400' }}
          />
          <NumberDecrementStepper
            color='whiteAlpha.600'
            border='none'
            _hover={{ color: 'brand.300' }}
            _active={{ color: 'brand.400' }}
          />
        </NumberInputStepper>
      )}
    </ChakraNumberInput>
  )
}

export default NumberInput
