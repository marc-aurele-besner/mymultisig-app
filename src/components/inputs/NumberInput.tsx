import React from 'react'
import {
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react'

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
  isReadOnly?: boolean
  isInvalid?: boolean
  hasStepper?: boolean
  allowMouseWheel?: boolean
}

const NumberInput: React.FC<NumberInputProps> = ({
  placeholder,
  size,
  defaultValue,
  value,
  min,
  max,
  precision,
  step,
  onChange,
  isDisabled,
  isReadOnly,
  isInvalid,
  hasStepper,
  allowMouseWheel
}) => {
  return (
    <ChakraNumberInput
      w='94%'
      p={4}
      m={2}
      mt={4}
      size={size}
      borderRadius={10}
      bg='cyan.100'
      color={'gray.700'}
      boxShadow='dark-lg'
      placeholder={placeholder}
      defaultValue={defaultValue}
      min={min}
      max={max}
      precision={precision}
      step={step}
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      allowMouseWheel={allowMouseWheel}>
      <NumberInputField />
      {hasStepper && (
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      )}
    </ChakraNumberInput>
  )
}

export default NumberInput
