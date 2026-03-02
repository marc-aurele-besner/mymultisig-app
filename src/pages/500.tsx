import React from 'react'
import { Heading } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import {} from '@chakra-ui/color-mode'

const Error: React.FC = () => {
  return (
    <Heading as='h1' size='lg' textAlign='center'>
      500 - Something went wrong
    </Heading>
  )
}

export default Error
