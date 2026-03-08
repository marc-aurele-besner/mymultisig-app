import React, { useEffect } from 'react'
import {
  Button,
  Text,
  useDisclosure,
  VStack,
  HStack,
  Box
} from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/modal'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/form-control'
import { WarningTwoIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import { buttonColors } from '../../styles/colors'

const MotionModalContent = motion.create(ModalContent)

const Disclaimer: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    onOpen()
  }, [onOpen])

  return (
    <Modal isOpen={open} onClose={onClose} isCentered>
      <ModalOverlay
        bg='blackAlpha.700'
        backdropFilter='blur(10px)'
      />
      <MotionModalContent
        maxW='600px'
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        bg='linear-gradient(135deg, rgba(13, 26, 63, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%)'
        backdropFilter='blur(20px) saturate(180%)'
        border='1px solid'
        borderColor='whiteAlpha.100'
        borderRadius='2xl'
        boxShadow='0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(56, 178, 172, 0.1)'
        mx={4}
      >
        <ModalHeader pt={6} pb={2}>
          <HStack gap={3}>
            <Box
              p={2}
              borderRadius='lg'
              bg='linear-gradient(135deg, rgba(237, 137, 54, 0.2) 0%, rgba(221, 107, 32, 0.2) 100%)'
            >
              <WarningTwoIcon color='orange.400' boxSize={5} />
            </Box>
            <Text
              fontSize='xl'
              fontWeight='700'
              bgGradient='linear(to-r, orange.300, yellow.400)'
              bgClip='text'
            >
              Important Disclaimer
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton
          color='whiteAlpha.600'
          _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
          borderRadius='lg'
        />
        
        <ModalBody py={4}>
          <VStack align='stretch' gap={4}>
            <Text fontSize='md' color='whiteAlpha.900' lineHeight='tall'>
              Welcome to MyMultiSig. Please note that this is a work in development and some features may be incomplete
              or not functioning as intended. By using this app, you acknowledge and accept that:
            </Text>
            
            <VStack align='stretch' gap={3} pl={4}>
              <Box as='li' color='whiteAlpha.800' fontSize='sm' lineHeight='tall' listStyleType='none'>
                The app may contain bugs, errors, or other issues that could potentially affect your experience or data.
              </Box>
              <Box as='li' color='whiteAlpha.800' fontSize='sm' lineHeight='tall' listStyleType='none'>
                We make no guarantees or warranties regarding the reliability, accuracy, or completeness of the app&apos;s
                features or content.
              </Box>
              <Box as='li' color='whiteAlpha.800' fontSize='sm' lineHeight='tall' listStyleType='none'>
                You assume all risks associated with using the app, and we are not responsible for any damages, losses, or
                liabilities that may result from your use of the app.
              </Box>
            </VStack>
            
            <Box
              p={4}
              borderRadius='xl'
              bg='whiteAlpha.50'
              border='1px solid'
              borderColor='whiteAlpha.100'
            >
              <Text fontSize='sm' color='whiteAlpha.700' lineHeight='tall'>
                We are continuously working to improve the app and fix any issues. If you encounter any problems or have
                suggestions, please feel free to contribute on GitHub.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter pt={2} pb={6}>
          <Button
            w='100%'
            size='lg'
            onClick={onClose}
            {...buttonColors}
          >
            I Understand & Accept
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  )
}

export default Disclaimer
