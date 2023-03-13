import React, { useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { useAccount } from 'wagmi'

import AddContactForm from '../forms/AddContactForm'

const NewContract: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { address } = useAccount()

  useEffect(() => {
    onOpen()
  }, [onOpen])

  if (!address) return <Text>Not connected</Text>

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Contract</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AddContactForm creator={address} />
        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={onClose}>
            Create
          </Button>
          <Button colorScheme='red' mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NewContract
