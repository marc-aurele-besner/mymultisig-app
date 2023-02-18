import React, { useState } from 'react'
import Link from 'next/link'
import { VStack, Text } from '@chakra-ui/react'
import { useNetwork } from 'wagmi'

import TextInput from '../inputs/TextInput'
import ConfirmationCard from '../cards/ConfirmationCard'
import NumberInput from '../inputs/NumberInput'
import ImageButton from '../buttons/ImageButton'
import { MultiSigFactory, MultiSig, MultiSigConstructorArgs } from '../../models/MultiSigs'
import useCreateMultiSig from '../../hooks/useCreateMultiSig'

interface CreateMultiSigFormProps {
  owner01: string
  factory: MultiSigFactory
}

const CreateMultiSigForm: React.FC<CreateMultiSigFormProps> = ({ owner01, factory }) => {
  const { chain } = useNetwork()
  const [multiSig, setMultiSig] = useState<MultiSig>({
    chainId: chain ? chain.id : 1,
    chainName: chain ? chain.name : 'Ethereum',
    factoryAddress: factory.address,
    id: factory.multiSigCount + 1,
    name: '',
    version: factory.version,
    address: '0x',
    threshold: 1,
    ownerCount: 1,
    nonce: 0,
    owners: [owner01, '', ''],
    isDeployed: false
  })

  const constructorArgs: MultiSigConstructorArgs = {
    contractName: multiSig.name,
    owners: multiSig.owners,
    threshold: multiSig.threshold
  }

  const { data, isLoading, isSuccess, write } = useCreateMultiSig(constructorArgs, factory.address)

  const handleOwnersChange = (event: React.ChangeEvent<HTMLInputElement>, input: number) => {
    setMultiSig({
      ...multiSig,
      owners: multiSig.owners.map((owner, index) => (index === input ? event.target.value : owner))
    })
  }
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>, input: keyof MultiSig) => {
    setMultiSig({ ...multiSig, [input]: event.target.value })
  }
  const handleAmountChange = (amount: number, input: keyof MultiSig) => {
    setMultiSig({ ...multiSig, [input]: amount })
  }
  // const handleAddOwner = () => {
  //   setMultiSig({ ...multiSig, ownerCount: multiSig.ownerCount + 1, owners: [...multiSig.owners, ''] })
  // }
  // const handleRemoveOwner = (index: number) => {
  //   setMultiSig({ ...multiSig, ownerCount: multiSig.ownerCount - 1, owners: multiSig.owners.filter((owner, i) => i !== index) })
  // }

  const handleCreateMultiSig = () => {
    write?.()
    // addMultiSig(multiSig)
  }

  return (
    <VStack>
      <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
        Chose a name for your Multi-Signature Contract
      </Text>
      <TextInput placeholder='MultiSig Name' onChange={(e) => handleValueChange(e, 'name')} />
      <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
        Add owners to your Multi-Signature Contract
      </Text>
      <TextInput placeholder={owner01} defaultValue={owner01} isReadOnly />
      <TextInput placeholder='owner02' onChange={(e) => handleOwnersChange(e, 1)} />
      <TextInput placeholder='owner03' onChange={(e) => handleOwnersChange(e, 2)} />
      <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
        Chose a threshold for your Multi-Signature Contract
      </Text>
      <NumberInput
        placeholder={owner01}
        defaultValue={1}
        min={1}
        max={3}
        step={1}
        onChange={(e) => handleAmountChange(parseInt(e), 'threshold')}
        hasStepper
        allowMouseWheel
      />
      <ImageButton
        placeholder='Create'
        imagePath='/images/create.png'
        onClick={() => handleCreateMultiSig()}
        isLoading={isLoading}
        isDisabled={!write}
      />
      {isLoading && (
        <Text fontSize='2xl' fontWeight='bold' color='white' pb='1rem'>
          Check Wallet
        </Text>
      )}
      {isSuccess && (
        <>
          <Link key={`LinkToExplorer`} href={`https://goerli.etherscan.io/tx/${data?.hash}`} target='_blank'>
            <ImageButton placeholder='See transaction in explorer' imagePath='/images/globe.png' />
          </Link>
          {data && data.hash && (
            <>
              <Text fontSize='lg' fontWeight='bold' color='white' pb='1rem'>
                Transaction hash: {data?.hash}
              </Text>
              <ConfirmationCard
                hash={data.hash}
                multiSigFactoryAddress={factory.address}
                constructorArgs={constructorArgs}
              />
            </>
          )}
        </>
      )}
    </VStack>
  )
}

export default CreateMultiSigForm
