import React, { useState } from 'react'
import Link from 'next/link'
import { VStack, Text, Box, HStack, Divider, Button, Badge } from '@chakra-ui/react'
import { useNetwork } from 'wagmi'
import { ExternalLinkIcon, CheckCircleIcon, AddIcon, InfoIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

import TextInput from '../inputs/TextInput'
import ConfirmationCard from '../cards/ConfirmationCard'
import NumberInput from '../inputs/NumberInput'
import { MultiSigFactory, MultiSig, MultiSigConstructorArgs } from '../../models/MultiSigs'
import useCreateMultiSig from '../../hooks/useCreateMultiSig'
import { buttonColors, glassButtonColors } from '../../styles/colors'

const MotionBox = motion(Box)

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

  const handleCreateMultiSig = () => {
    write?.()
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`

  return (
    <VStack spacing={6} w='100%'>
      {/* Step 1: Name */}
      <Box w='100%'>
        <HStack mb={3}>
          <Badge
            bg='linear-gradient(135deg, #38b2ac 0%, #319795 100%)'
            color='white'
            px={2}
            py={1}
            borderRadius='md'
            fontSize='xs'
          >
            Step 1
          </Badge>
          <Text fontSize='lg' fontWeight='600' color='white'>
            Name Your MultiSig
          </Text>
        </HStack>
        <TextInput
          placeholder='Enter a name for your MultiSig wallet'
          onChange={(e) => handleValueChange(e, 'name')}
        />
      </Box>

      <Divider borderColor='whiteAlpha.100' />

      {/* Step 2: Owners */}
      <Box w='100%'>
        <HStack mb={3}>
          <Badge
            bg='linear-gradient(135deg, #38b2ac 0%, #319795 100%)'
            color='white'
            px={2}
            py={1}
            borderRadius='md'
            fontSize='xs'
          >
            Step 2
          </Badge>
          <Text fontSize='lg' fontWeight='600' color='white'>
            Add Owners
          </Text>
        </HStack>
        <Text fontSize='sm' color='whiteAlpha.600' mb={4}>
          Add wallet addresses that will have signing authority
        </Text>
        
        <VStack spacing={3} w='100%'>
          <Box w='100%' position='relative'>
            <TextInput
              placeholder={truncateAddress(owner01)}
              defaultValue={truncateAddress(owner01)}
              isReadOnly
            />
            <Badge
              position='absolute'
              right={6}
              top='50%'
              transform='translateY(-50%)'
              bg='brand.500'
              color='white'
              fontSize='xs'
            >
              You
            </Badge>
          </Box>
          <TextInput
            placeholder='Owner 2 address (0x...)'
            onChange={(e) => handleOwnersChange(e, 1)}
          />
          <TextInput
            placeholder='Owner 3 address (0x...)'
            onChange={(e) => handleOwnersChange(e, 2)}
          />
        </VStack>
      </Box>

      <Divider borderColor='whiteAlpha.100' />

      {/* Step 3: Threshold */}
      <Box w='100%'>
        <HStack mb={3}>
          <Badge
            bg='linear-gradient(135deg, #38b2ac 0%, #319795 100%)'
            color='white'
            px={2}
            py={1}
            borderRadius='md'
            fontSize='xs'
          >
            Step 3
          </Badge>
          <Text fontSize='lg' fontWeight='600' color='white'>
            Set Threshold
          </Text>
        </HStack>
        <HStack spacing={2} mb={4}>
          <InfoIcon color='whiteAlpha.600' boxSize={3} />
          <Text fontSize='sm' color='whiteAlpha.600'>
            Number of signatures required to execute a transaction
          </Text>
        </HStack>
        
        <NumberInput
          placeholder='Threshold'
          defaultValue={1}
          min={1}
          max={3}
          step={1}
          onChange={(e) => handleAmountChange(parseInt(e), 'threshold')}
          hasStepper
          allowMouseWheel
        />
      </Box>

      <Divider borderColor='whiteAlpha.100' />

      {/* Create Button */}
      <Box w='100%' pt={2}>
        <Button
          w='100%'
          size='lg'
          leftIcon={<AddIcon />}
          onClick={handleCreateMultiSig}
          isLoading={isLoading}
          isDisabled={!write || !multiSig.name}
          {...buttonColors}
        >
          Create MultiSig
        </Button>
        
        {!multiSig.name && (
          <Text fontSize='xs' color='whiteAlpha.500' textAlign='center' mt={2}>
            Please enter a name for your MultiSig
          </Text>
        )}
      </Box>

      {/* Loading State */}
      {isLoading && (
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          w='100%'
          p={4}
          borderRadius='xl'
          bg='linear-gradient(135deg, rgba(56, 178, 172, 0.15) 0%, rgba(0, 132, 255, 0.15) 100%)'
          border='1px solid'
          borderColor='brand.400'
        >
          <HStack spacing={3} justify='center'>
            <Box
              w={3}
              h={3}
              borderRadius='full'
              bg='brand.400'
              animation='pulse 1.5s infinite'
              sx={{
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }}
            />
            <Text fontSize='md' fontWeight='500' color='brand.300'>
              Please confirm the transaction in your wallet...
            </Text>
          </HStack>
        </MotionBox>
      )}

      {/* Success State */}
      {isSuccess && data?.hash && (
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          w='100%'
        >
          <VStack spacing={4}>
            <Box
              w='100%'
              p={4}
              borderRadius='xl'
              bg='linear-gradient(135deg, rgba(72, 187, 120, 0.15) 0%, rgba(56, 161, 105, 0.15) 100%)'
              border='1px solid'
              borderColor='green.400'
            >
              <HStack spacing={3}>
                <CheckCircleIcon color='green.400' boxSize={5} />
                <VStack align='flex-start' spacing={0}>
                  <Text fontSize='md' fontWeight='600' color='green.300'>
                    Transaction Submitted!
                  </Text>
                  <Text fontSize='xs' color='whiteAlpha.600'>
                    Hash: {data.hash.slice(0, 20)}...{data.hash.slice(-10)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
            
            <Link href={`https://goerli.etherscan.io/tx/${data.hash}`} target='_blank'>
              <Button
                leftIcon={<ExternalLinkIcon />}
                {...glassButtonColors}
                size='md'
              >
                View on Explorer
              </Button>
            </Link>

            <ConfirmationCard
              hash={data.hash}
              multiSigFactoryAddress={factory.address}
              constructorArgs={constructorArgs}
            />
          </VStack>
        </MotionBox>
      )}
    </VStack>
  )
}

export default CreateMultiSigForm
