import React, { useState, useEffect } from 'react'
import {
  Button,
  Text,
  useDisclosure
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
import {} from '@chakra-ui/color-mode'
import { v4 } from 'uuid'
import { useAccount, useChainId, useChains } from 'wagmi'

import { Contract } from '../../models/Contracts'
import AddContactForm from '../forms/AddContactForm'
import useContracts from '../../states/contracts'

const NewContract: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure()
  const { address } = useAccount()
  const chainId = useChainId(); const chains = useChains(); const chain = chains.find(c => c.id === chainId)
  const addContract = useContracts((state) => state.addContract)
  const [contract, setContract] = useState<Contract>({
    chainId: chain ? chain.id : 1,
    chainName: chain ? chain.name : 'Ethereum',
    id: v4(),
    name: '',
    address: '0x',
    creator: address || '0x',
    abi: [],
    isMultiSig: false,
    isPublic: false,
    isVerified: false,
    isWhitelisted: false,
    isChainSpecific: false,
    isWalletSpecific: true
  })

  const handleSubmit = () => {
    addContract(contract)
    onClose()
  }

  useEffect(() => {
    onOpen()
  }, [onOpen])

  if (!address) return <Text>Not connected</Text>

  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Contract</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <AddContactForm contract={contract} setContract={setContract} />
        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
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
