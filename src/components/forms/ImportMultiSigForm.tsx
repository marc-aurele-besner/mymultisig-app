import React, { useState } from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

import TextInput from '../inputs/TextInput'
import ImageButton from '../buttons/ImageButton'
import ImportConfirmationCard from '../cards/ImportConfirmationCard'
import { MultiSigFactory } from '../../models/MultiSigs'

interface ImportMultiSigFormProps {
  factory: MultiSigFactory
}

const ImportMultiSigForm: React.FC<ImportMultiSigFormProps> = ({ factory }) => {
  const { address } = useAccount()
  const [multiSigAddress, setMultiSigAddress] = useState<`0x${string}`>('0x')
  const [importClicked, setImportClicked] = useState<boolean>(false)

  const handleImportMultiSig = () => {
    setImportClicked(true)
  }

  const handleChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 42) setMultiSigAddress(`0x${e.target.value.substring(2, e.target.value.length)}`)
  }

  return (
    <VStack>
      {importClicked && address ? (
        <ImportConfirmationCard factoryAddress={factory.address} multiSigAddress={multiSigAddress} address={address} />
      ) : (
        <>
          <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
            The multi sig contract address
          </Text>
          <TextInput placeholder='MultiSig Address' onChange={(e) => handleChangeAddress(e)} />
          <ImageButton
            placeholder='Import'
            imagePath='/images/import.png'
            onClick={() => handleImportMultiSig()}
            // isLoading={isLoading}
            isDisabled={multiSigAddress !== `0x`}
          />
        </>
      )}
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
