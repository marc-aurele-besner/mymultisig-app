import React, { useState } from 'react'
import Link from 'next/link'
import { VStack, Text } from '@chakra-ui/react'
import { useNetwork } from 'wagmi'

import TextInput from '../inputs/TextInput'
import ImageButton from '../buttons/ImageButton'
import { MultiSigFactory, MultiSig } from '../../models/MultiSigs'

interface ImportMultiSigFormProps {
  factory: MultiSigFactory
}

const ImportMultiSigForm: React.FC<ImportMultiSigFormProps> = ({ factory }) => {
  const { chain } = useNetwork()
  const [multiSigAddress, setMultiSigAddress] = useState<string>('0x')

  // const { data, isLoading, isSuccess, write } = useCreateMultiSig(
  //   {
  //     contractName: multiSig.name,
  //     owners: multiSig.owners,
  //     threshold: multiSig.threshold
  //   },
  //   factory.address
  // )

  // const handleOwnersChange = (event: React.ChangeEvent<HTMLInputElement>, input: number) => {
  //   setMultiSig({
  //     ...multiSig,
  //     owners: multiSig.owners.map((owner, index) => (index === input ? event.target.value : owner))
  //   })
  // }
  // const handleAddOwner = () => {
  //   setMultiSig({ ...multiSig, ownerCount: multiSig.ownerCount + 1, owners: [...multiSig.owners, ''] })
  // }
  // const handleRemoveOwner = (index: number) => {
  //   setMultiSig({ ...multiSig, ownerCount: multiSig.ownerCount - 1, owners: multiSig.owners.filter((owner, i) => i !== index) })
  // }

  const handleFindMultiSig = () => {
    // write?.()
    // addMultiSig(multiSig)
  }

  return (
    <VStack>
      <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
        The multi sig contract address
      </Text>
      <TextInput placeholder='MultiSig Address' onChange={(e) => setMultiSigAddress(e.target.value)} />
      <ImageButton
        placeholder='Import'
        imagePath='/images/import.png'
        onClick={() => handleFindMultiSig()}
        // isLoading={isLoading}
        // isDisabled={!write}
      />
      {/* {isLoading && (
        <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
          Check Wallet
        </Text>
      )}
      {isSuccess && (
        <>
          <Text fontSize='lg' fontWeight='bold' color='white' pb='1rem'>
            Contract found!
          </Text>
        </>
      )} */}
    </VStack>
  )
}

export default ImportMultiSigForm
