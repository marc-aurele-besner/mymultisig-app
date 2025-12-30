import React from 'react'
import { Button, HStack, Image, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface ImageButtonProps {
  placeholder: string
  imagePath: string
  onClick?: () => void
  isLoading?: boolean
  isDisabled?: boolean
  variant?: 'primary' | 'secondary' | 'glass'
}

const MotionButton = motion(Button)

const ImageButton: React.FC<ImageButtonProps> = ({
  placeholder,
  imagePath,
  onClick,
  isLoading,
  isDisabled,
  variant = 'primary'
}) => {
  const variants = {
    primary: {
      bg: 'linear-gradient(135deg, #38b2ac 0%, #319795 50%, #2c7a7b 100%)',
      boxShadow: '0 4px 20px rgba(56, 178, 172, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      _hover: {
        bg: 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 50%, #319795 100%)',
        boxShadow: '0 8px 30px rgba(56, 178, 172, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
      }
    },
    secondary: {
      bg: 'linear-gradient(135deg, #0084ff 0%, #006acc 100%)',
      boxShadow: '0 4px 20px rgba(0, 132, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      _hover: {
        boxShadow: '0 8px 30px rgba(0, 132, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
      }
    },
    glass: {
      bg: 'whiteAlpha.100',
      backdropFilter: 'blur(10px)',
      border: '1px solid',
      borderColor: 'whiteAlpha.200',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      _hover: {
        bg: 'whiteAlpha.200',
        borderColor: 'whiteAlpha.300',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }
    }
  }

  const selectedVariant = variants[variant]

  return (
    <MotionButton
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      key={placeholder}
      w={{ base: '100%', md: '94%' }}
      h='auto'
      py={4}
      px={6}
      m={2}
      borderRadius='xl'
      color='white'
      fontWeight='600'
      fontSize='md'
      onClick={onClick}
      isLoading={isLoading}
      isDisabled={isDisabled}
      _disabled={{
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none'
      }}
      {...selectedVariant}
    >
      <HStack w='100%' justifyContent='center' spacing={3}>
        <Image
          src={imagePath}
          alt={placeholder}
          w='24px'
          h='24px'
          borderRadius='md'
          objectFit='contain'
        />
        <Text>{placeholder}</Text>
      </HStack>
    </MotionButton>
  )
}

export default ImageButton
